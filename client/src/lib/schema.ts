export interface ExecuteCodeResponse {
  output: string
  time_elapsed: number
}

export interface ExecuteCodeRequest {
  code: string
  language: string
}
