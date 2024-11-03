package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/go-playground/validator/v10"
)

const PORT = ":8080"

type ExecuteCodeRequest struct {
	Code     string `json:"code" validate:"required"`
	Language string `json:"language" validate:"required"`
}


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

	fmt.Fprintf(w, "executing code %s in language %s", request.Code, request.Language)
}

func setupRoutes() {
	http.HandleFunc("/execute-code", executeCode)
}

func main() {
	fmt.Printf("staring server on port %s\n", PORT)
	setupRoutes()
	log.Fatal(http.ListenAndServe(PORT, nil))
}
