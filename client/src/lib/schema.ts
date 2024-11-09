import { Problem } from "@/mongo/schema"

export interface ExecuteCodeResponse {
  output: string
  time_elapsed: number
}

export interface ExecuteCodeRequest {
  code: string
  language: string
}

export interface GetProblemRequest {
  problemId: string
}

export interface GetProblemResponse {
  markdownHtml: string
}

export interface InsertProblemRequest {
  problem: Problem
}
export interface InsertProblemResponse {
  problemId: string
}
