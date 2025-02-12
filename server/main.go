package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"time"

	"github.com/go-playground/validator/v10"
)

const pythonImage = "python:3.13.0-alpine3.19"
const goImage = "golang:1.22.8-alpine3.19"

func handleExecuteCode(w http.ResponseWriter, r *http.Request) {
	var request ExecuteCodeRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	validate := validator.New(validator.WithRequiredStructEnabled())
	if err := validate.Struct(request); err != nil {
		log.Printf("Validation error: %v", err)
		http.Error(w, "Invalid request parameters", http.StatusBadRequest)
		return
	}

	log.Printf("Received execution request for language: %s", request.Language)

	start := time.Now()

	var (
		output string
		err    error
	)

	switch request.Language {
	case Python:
		output, err = executePythonCode(request.Code)
		if err != nil {
			log.Printf("Error executing Python code: %v", err)
			http.Error(w, fmt.Sprintf("Execution error: %v %s. Finished in %dms", err, output, time.Since(start).Milliseconds()), http.StatusInternalServerError)
			return
		}
	case Go:
		output, err = executeGoCode(request.Code)
		if err != nil {
			log.Printf("Error executing Go code: %v", err)
			http.Error(w, fmt.Sprintf("Execution error: %v %s. Finished in %dms", err, output, time.Since(start).Milliseconds()), http.StatusInternalServerError)
			return
		}
	default:
		log.Printf("Unsupported language requested: %s", request.Language)
		http.Error(w, "Unsupported language", http.StatusBadRequest)
		return
	}
	response := ExecuteCodeResponse{
		Output:      output,
		TimeElapsed: int(time.Since(start).Milliseconds()),
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
}

/**
 * Go code execution
 */

func executeGoCode(code string) (string, error) {
	if enableLocalExecution := os.Getenv("ENABLE_LOCAL_CODE_EXECUTION"); enableLocalExecution == "true" {
		return executeGoCodeLocally(code)
	}

	return executeGoCodeInContainer(code)
}

func executeGoCodeInContainer(code string) (string, error) {
	encodedCode := base64.StdEncoding.EncodeToString([]byte(code))
	command := fmt.Sprintf("sh -c 'echo \"%s\" | base64 -d > program.go && go run program.go'", encodedCode)

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx,
		"docker", "run", "--rm",
		"--env-file", ".env.docker",
		// "--cpus", "1", "--memory", "256m",
		// "--network", "none",
		// "--pids-limit", "100",
		// "--security-opt", "no-new-privileges",
		goImage,
		"sh", "-c", command,
	)

	output, err := cmd.CombinedOutput()

	if ctx.Err() == context.DeadlineExceeded {
		log.Printf("Docker execution timed out")
		return "", fmt.Errorf("execution timed out")
	}

	if err != nil {
		log.Printf("Docker execution error: %v, Output: %s", err, output)
		return string(output), err
	}

	log.Printf("Go code executed successfully in Docker container")
	return string(output), nil
}

func executeGoCodeLocally(code string) (string, error) {
	encodedCode := base64.StdEncoding.EncodeToString([]byte(code))
	command := fmt.Sprintf("sh -c 'echo \"%s\" | base64 -d > program.go && go run program.go && rm program.go'", encodedCode)

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "sh", "-c", command)
	output, err := cmd.CombinedOutput()

	if ctx.Err() == context.DeadlineExceeded {
		log.Printf("Go execution timed out")
		return "", fmt.Errorf("execution timed out")
	}

	if err != nil {
		log.Printf("Go execution error: %v, Output: %s", err, output)
		return string(output), err
	}

	log.Printf("Go code executed successfully using local Go")
	return string(output), nil
}

/**
 * Python code execution
 */
func executePythonCode(code string) (string, error) {
	if enableLocalExecution := os.Getenv("ENABLE_LOCAL_CODE_EXECUTION"); enableLocalExecution == "true" {
		return executePythonCodeLocally(code)
	}

	return executePythonCodeInContainer(code)
}

func executePythonCodeInContainer(code string) (string, error) {
	encodedCode := base64.StdEncoding.EncodeToString([]byte(code))
	command := fmt.Sprintf("sh -c 'echo \"%s\" | base64 -d > program.py && python3 program.py'", encodedCode)

	cmd := exec.Command(
		"docker", "run", "--env-file", ".env.docker", "--rm", pythonImage,
		"sh", "-c", command,
	)

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	output, err := cmd.CombinedOutput()

	if ctx.Err() == context.DeadlineExceeded {
		log.Printf("Docker Python execution timed out")
		return "", fmt.Errorf("execution timed out")
	}

	if err != nil {
		log.Printf("Docker Python execution error: %v, Output: %s", err, output)
		return "", err
	}

	log.Printf("Python code executed successfully in Docker container")
	return string(output), nil
}

func executePythonCodeLocally(code string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "python3", "-c", code)
	output, err := cmd.CombinedOutput()

	if ctx.Err() == context.DeadlineExceeded {
		log.Printf("Python execution timed out")
		return "", fmt.Errorf("execution timed out")
	}

	if err != nil {
		log.Printf("Python execution error: %v, Output: %s", err, output)
		return "", err
	}

	log.Printf("Python code executed successfully using local Python")
	return string(output), nil
}

func setupRoutes() {
	http.HandleFunc("/execute-code", handleExecuteCode)
}

func pullGoImage() error {
	log.Printf("Pulling Go image: %s", goImage)
	cmd := exec.Command("docker", "pull", goImage)

	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("Error pulling Go image: %v, Output: %s", err, output)
		return err
	}

	log.Printf("Go image pulled successfully")
	return nil
}

func pullPythonImage() error {
	log.Printf("Pulling Python image: %s", pythonImage)
	cmd := exec.Command("docker", "pull", pythonImage)

	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("Error pulling Python image: %v, Output: %s", err, output)
		return err
	}

	log.Printf("Python image pulled successfully")
	return nil
}

func getEnvironment() string {
	if env := os.Getenv("ENVIRONMENT"); env != "" {
		return env
	}
	return "local"
}

func getPort() string {
	if port := os.Getenv("PORT"); port != "" {
		return port
	}
	return "8080"
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	env := getEnvironment()
	port := getPort()

	address := fmt.Sprintf(":%s", port)
	log.Printf("Starting server on port %s (%s environment)", port, env)

	if enableLocalExecution := os.Getenv("ENABLE_LOCAL_CODE_EXECUTION"); enableLocalExecution == "false" {
		if err := pullGoImage(); err != nil {
			log.Fatalf("Failed to pull Go image: %v", err)
		}

		if err := pullPythonImage(); err != nil {
			log.Fatalf("Failed to pull Python image: %v", err)
		}
	}

	setupRoutes()
	log.Fatal(http.ListenAndServe(address, nil))
}
