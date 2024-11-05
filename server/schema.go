package main

type ExecuteCodeRequest struct {
	Code     string            `json:"code" validate:"required"`
	Language SupportedLanguage `json:"language" validate:"required"`
}

type ExecuteCodeResponse struct {
	Output      string `json:"output"`
	TimeElapsed int    `json:"time_elapsed"`
}

type SupportedLanguage string

const (
	Python SupportedLanguage = "python"
	Go     SupportedLanguage = "go"
)
