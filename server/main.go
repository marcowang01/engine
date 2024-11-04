package main

import (
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

func handleExecuteCode(w http.ResponseWriter, r *http.Request) {
	var request ExecuteCodeRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	validate := validator.New(validator.WithRequiredStructEnabled())
	if err := validate.Struct(request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	fmt.Printf("recv request:\n%+v\n", request)

	if request.Language != "python" {
		http.Error(w, "unsupported language", http.StatusBadRequest)
		return
	}

	start := time.Now()
	output, err := runPythonDockerContainer(request.Code)
	if err != nil {
		errorMessage := fmt.Sprintf("%s\n%s", err, output)
		http.Error(w, errorMessage, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	response := ExecuteCodeResponse{
		Output:      output,
		TimeElapsed: int(time.Since(start).Milliseconds()),
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func runPythonDockerContainer(code string) (string, error) {
	// encode and decode the code to avoid issues with special characters (i.e. quotes)
	encodedCode := base64.StdEncoding.EncodeToString([]byte(code))
	command := fmt.Sprintf("sh -c 'echo \"%s\" | base64 -d > program.py && python3 program.py'", encodedCode)

	cmd := exec.Command(
		"docker", "run", "--env-file", ".env.docker", "--rm", pythonImage,
		"sh", "-c", command,
	)

	output, err := cmd.CombinedOutput()
	fmt.Printf("output from running python container: %s\n", string(output))
	fmt.Printf("error from running python container: %s\n", err)
	return string(output), err
}

func executePythonCode(code string) (string, error) {
	cmd := exec.Command("python3", "-c", code)
	output, err := cmd.CombinedOutput()
	fmt.Printf("output from python: %s\n", string(output))
	fmt.Printf("error from python: %s\n", err)
	return string(output), err
}

func setupRoutes() {
	http.HandleFunc("/execute-code", handleExecuteCode)
}

func pullPythonImage() (string, error) {
	fmt.Printf("pulling python image: %s\n", pythonImage)
	cmd := exec.Command(
		"docker", "pull",
		pythonImage,
	)

	output, err := cmd.CombinedOutput()
	fmt.Printf(" %s\ndone pulling python image\n", string(output))
	return string(output), err
}

func getEnvironment() string {
	env := os.Getenv("ENVIRONMENT")
	if env == "" {
		env = "local"
	}
	return env
}

func getPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	return port
}

func main() {
	env := getEnvironment()
	port := getPort()

	address := fmt.Sprintf(":%s", port)
	fmt.Printf("starting server on port %s (%s)\n", port, env)

	if output, err := pullPythonImage(); err != nil {
		log.Fatalf("failed to pull python image: %s\n%s", err, output)
	}

	setupRoutes()
	log.Fatal(http.ListenAndServe(address, nil))
}
