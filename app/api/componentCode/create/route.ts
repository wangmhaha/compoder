import { NextRequest, NextResponse } from "next/server"
import { ComponentCodeApi } from "../type"
import { getUserId } from "@/lib/auth/middleware"
import { connectToDatabase } from "@/lib/db/mongo"
import { validateSession } from "@/lib/auth/middleware"
import { createComponentCode } from "@/lib/db/componentCode/mutations"

export const UNINITIALIZED_COMPONENT_NAME = "uninitialized component"
export const UNINITIALIZED_COMPONENT_DESCRIPTION =
  "This component is not initialized yet"

export async function POST(request: NextRequest) {
  try {
    const authError = await validateSession()
    if (authError) {
      return authError
    }

    await connectToDatabase()

    const userId = await getUserId()

    const body = (await request.json()) as ComponentCodeApi.createRequest

    const component = await createComponentCode({
      userId: userId!,
      codegenId: body.codegenId,
      name: UNINITIALIZED_COMPONENT_NAME,
      description: UNINITIALIZED_COMPONENT_DESCRIPTION,
      prompt: body.prompt,
      // created component code is empty, need to be initialized
      code: "",
    })
    return new Response(JSON.stringify({ data: component }))
  } catch (error) {
    console.error("Failed to get component code detail:", error)
    return NextResponse.json(
      { error: "Failed to get component code detail" },
      { status: 500 },
    )
  }
}
