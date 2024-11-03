package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os/exec"

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

	output, err := executePythonCode(request.Code)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Printf("output: %s\n", output)

	w.Header().Set("Content-Type", "application/json")

	response := ExecuteCodeResponse{
		Output: output,
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func executePythonCode(code string) (string, error) {
	cmd := exec.Command("python3", "-c", code)
	output, err := cmd.CombinedOutput()
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
