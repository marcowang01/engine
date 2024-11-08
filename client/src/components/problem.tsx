"use client"

import { GetProblemRequest, GetProblemResponse } from "@/lib/schema"
import { marked } from "marked"
import DOMPurify from "dompurify"
import { useEffect, useMemo, useState } from "react"

export default function ProblemMarkdown({ problemId }: { problemId: string }) {
  const [problem, setProblem] = useState("")

  useEffect(() => {
    const fetchProblem = async (request: GetProblemRequest) => {
      const res = await fetch(`/api/get-problem?problemId=${request.problemId}`)
      const data = (await res.json()) as GetProblemResponse
      setProblem(data.markdownHtml)
    }

    void fetchProblem({ problemId })
  }, [problemId])

  const cleanHtml = useMemo(() => {
    if (!problem) {
      return "no problem found"
    }

    const dirtyHtml = marked.parse(
      problem.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, "")
    ) as string
    return DOMPurify.sanitize(dirtyHtml)
  }, [problem])

  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
}
