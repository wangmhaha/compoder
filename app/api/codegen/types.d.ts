import { Codegen } from "@/lib/db/codegen/types"

declare namespace CodegenApi {
  // codegen list request
  export interface ListRequest {
    page: number
    pageSize: number
    name?: string
    fullStack?: "React" | "Vue"
  }
  // codegen list response
  export interface ListResponse {
    data: Pick<Codegen, "title" | "description" | "fullStack">[]
    total: number
  }
}
