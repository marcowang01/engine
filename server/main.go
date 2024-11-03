package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/go-playground/validator/v10"
)

const PORT = ":8080"

func executeCode(w http.ResponseWriter, r *http.Request) {
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

	w.Header().Set("Content-Type", "application/json")

	response := ExecuteCodeResponse{
		Output: fmt.Sprintf("executing code %s in language %s", request.Code, request.Language),
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func setupRoutes() {
	http.HandleFunc("/execute-code", executeCode)
}

func main() {
	fmt.Printf("staring server on port %s\n", PORT)
	setupRoutes()
	log.Fatal(http.ListenAndServe(PORT, nil))
}
