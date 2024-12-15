import { getInstance } from "../request"
import { CodegenApi } from "@/app/api/codegen/types"
const request = getInstance()

export const getCodegenList = async (
  params: CodegenApi.ListRequest,
): Promise<CodegenApi.ListResponse> => {
  const response = await request.get("/codegen/list", { params })
  return response.data
}
