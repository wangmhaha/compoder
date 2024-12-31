import { NextRequest, NextResponse } from "next/server"
import { getComponentCodeDetail } from "@/lib/db/componentCode/selectors"
import { ComponentCodeApi } from "../type"
import { ComponentCode } from "@/lib/db/componentCode/types"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: 400 },
      )
    }

    const data = (await getComponentCodeDetail(id)) as ComponentCode

    const response: ComponentCodeApi.detailResponse = {
      data: {
        _id: data._id,
        name: data.name,
        description: data.description,
        versions: data.versions,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Failed to get component code detail:", error)
    return NextResponse.json(
      { error: "Failed to get component code detail" },
      { status: 500 },
    )
  }
}
