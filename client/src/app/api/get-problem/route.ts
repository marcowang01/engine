import { GetProblemResponse } from "@/lib/schema"
import { findOne } from "@/mongo/client"
import { Problem, PROBLEMS_COLL } from "@/mongo/schema"
import { ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const problemId = searchParams.get("problemId")

  if (!problemId) {
    return NextResponse.json({ error: "problemId is required" }, { status: 400 })
  }

  const problem = await findOne<Problem>(PROBLEMS_COLL, { _id: problemId as unknown as ObjectId })


  if (!problem) {
    return NextResponse.json({ error: "problem not found" }, { status: 404 })
  }

  const response: GetProblemResponse = {
    title: problem.title,
    markdownHtml: problem.description,
  }

  return NextResponse.json(response)
}