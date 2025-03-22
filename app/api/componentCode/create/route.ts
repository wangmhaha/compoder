import { NextRequest, NextResponse } from "next/server"
import { run } from "@/app/api/ai-core/workflow"
import { ComponentCodeApi } from "../type"
import { findCodegenById } from "@/lib/db/codegen/selectors"
import { getOpenaiClient } from "@/app/api/ai-core/utils/aiClient"
import { getUserId } from "@/lib/auth/middleware"
import { connectToDatabase } from "@/lib/db/mongo"
import { validateSession } from "@/lib/auth/middleware"
import { LanguageModel } from "ai"

const aiModel = getOpenaiClient("anthropic/claude-3.7-sonnet") as LanguageModel

export async function POST(request: NextRequest) {
  try {
    const authError = await validateSession()
    if (authError) {
      return authError
    }

    await connectToDatabase()

    const userId = await getUserId()

    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    const body = (await request.json()) as ComponentCodeApi.createRequest
    const codegenDetail = await findCodegenById(body.codegenId)

    const response = new Response(stream.readable)

    run({
      stream: {
        write: (chunk: string) => writer.write(encoder.encode(chunk)),
        close: () => writer.close(),
      },
      query: {
        prompt: body.prompt,
        aiModel,
        rules: codegenDetail.rules,
        userId: userId!,
        codegenId: body.codegenId,
      },
    })

    return response
  } catch (error) {
    console.error("Failed to get component code detail:", error)
    return NextResponse.json(
      { error: "Failed to get component code detail" },
      { status: 500 },
    )
  }
}
