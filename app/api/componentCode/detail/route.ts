import { NextRequest, NextResponse } from "next/server"
import { getComponentCodeDetail } from "@/lib/db/componentCode/selectors"
import { ComponentCodeApi } from "../type"
import { ComponentCode } from "@/lib/db/componentCode/types"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ComponentCodeApi.detailRequest

    const data = (await getComponentCodeDetail(body.id)) as ComponentCode

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
