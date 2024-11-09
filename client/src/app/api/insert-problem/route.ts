import { InsertProblemRequest, InsertProblemResponse } from "@/lib/schema"
import { insertOne } from "@/mongo/client"
import { PROBLEMS_COLL } from "@/mongo/schema"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body: InsertProblemRequest = await request.json()

  const { problem } = body
  const problemId = crypto.randomUUID()

  await insertOne(PROBLEMS_COLL, {
    _id: problemId,
    ...problem,
  })

  const response: InsertProblemResponse = {
    problemId,
  }

  return NextResponse.json(response)
}
