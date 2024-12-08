import { CodegenModel } from "./schema"
import { CodegenApi } from "@/app/api/codegen/types"

export async function findCodegens(params: CodegenApi.ListRequest) {
  const { page, pageSize, name, fullStack } = params

  // Build query conditions
  const query: Record<string, unknown> = {}

  if (name) {
    // Use regex for fuzzy title search
    query.title = { $regex: name, $options: "i" }
  }

  if (fullStack) {
    query.fullStack = fullStack
  }

  // Execute query
  const skip = (page - 1) * pageSize

  const [data, total] = await Promise.all([
    CodegenModel.find(query)
      .select("title description fullStack")
      .skip(skip)
      .limit(pageSize)
      .lean(),
    CodegenModel.countDocuments(query),
  ])

  return {
    data,
    total,
  }
}
