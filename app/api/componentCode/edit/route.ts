import { NextRequest, NextResponse } from "next/server"
import { run } from "@/app/api/ai-core/workflow"
import { ComponentCodeApi } from "../type"
import { findCodegenById } from "@/lib/db/codegen/selectors"
import { getOpenaiClient } from "@/app/api/ai-core/utils/aiClient"
import { getUserId } from "@/lib/auth/middleware"
import { connectToDatabase } from "@/lib/db/mongo"
import { validateSession } from "@/lib/auth/middleware"

const aiModel = getOpenaiClient()

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const params: ComponentCodeApi.editRequest = {
      codegenId: searchParams.get("codegenId") || "",
      prompt: JSON.parse(searchParams.get("prompt") || "[]"),
      component: JSON.parse(searchParams.get("component") || "{}"),
    }

    // 参数验证
    if (!params.codegenId || !params.prompt || !params.component) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      )
    }

    const codegenDetail = await findCodegenById(params.codegenId)

    run({
      stream: {
        write: (chunk: string) => writer.write(encoder.encode(chunk)),
        close: () => writer.close(),
      },
      query: {
        prompt: params.prompt,
        aiModel,
        rules: codegenDetail.rules,
        userId: userId!,
        component: params.component,
      },
    })

    return new Response(stream.readable)
  } catch (error) {
    console.error("Failed to get component code detail:", error)
    return NextResponse.json(
      { error: "Failed to get component code detail" },
      { status: 500 },
    )
  }
}
