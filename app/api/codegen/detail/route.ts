import { NextRequest } from "next/server"
import { findCodegenById } from "@/lib/db/codegen/selectors"
import { CodegenApi } from "../types"
import { connectToDatabase } from "@/lib/db/mongo"
import { validateSession } from "@/lib/auth/middleware"

export async function POST(request: NextRequest) {
  try {
    // Add identity verification check
    const authError = await validateSession()
    if (authError) {
      return authError
    }

    await connectToDatabase()

    const body = (await request.json()) as CodegenApi.DetailRequest
    const { id } = body

    const data = await findCodegenById(id)

    return Response.json({
      data,
    } satisfies CodegenApi.DetailResponse)
  } catch (error) {
    console.error("[CODEGEN_DETAIL]", error)
    return Response.json(
      { error: "Failed to fetch codegen detail" },
      { status: 500 },
    )
  }
}
