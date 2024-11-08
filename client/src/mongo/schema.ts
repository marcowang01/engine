import "server-only"

export const PROBLEMS_COLL = "problems"

export interface Problem {
  id: string
  title: string
  description: string
}
