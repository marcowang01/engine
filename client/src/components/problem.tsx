"use client"

import { GetProblemRequest, GetProblemResponse } from "@/lib/schema"
import DOMPurify from "dompurify"
import { marked } from "marked"
import { useEffect, useMemo, useState } from "react"

export default function ProblemMarkdownPanel({ problemId }: { problemId: string }) {
  const [problem, setProblem] = useState("")
  const [title, setTitle] = useState("")

  useEffect(() => {
    const fetchProblem = async (request: GetProblemRequest) => {
      const res = await fetch(`/api/get-problem?problemId=${request.problemId}`)
      const data = (await res.json()) as GetProblemResponse
      setProblem(data.markdownHtml)
      setTitle(data.title)
    }

    void fetchProblem({ problemId })
  }, [problemId])

  const cleanHtml = useMemo(() => {
    if (!problem) {
      return "no problem found"
    }

    const renderer = new marked.Renderer()
    const dirtyHtml = marked.parse(problem.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, ""), {
      renderer,
    }) as string
    return DOMPurify.sanitize(dirtyHtml)
  }, [problem])

  return (
    <div className="px-2 pt-2">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="markdown" dangerouslySetInnerHTML={{ __html: cleanHtml }} />
    </div>
  )
}
