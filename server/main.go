package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"time"

	"github.com/go-playground/validator/v10"
)

const PORT = ":8080"

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
	output, err := executePythonCode(request.Code)
	if err != nil {
		errorMessage := fmt.Sprintf("%s\n%s", err, output)
		http.Error(w, errorMessage, http.StatusInternalServerError)
		return
	}

	fmt.Printf("output: %s\n", output)

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

func main() {
	fmt.Printf("staring server on port %s\n", PORT)
	setupRoutes()
	log.Fatal(http.ListenAndServe(PORT, nil))
}
