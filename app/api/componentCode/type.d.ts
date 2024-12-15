import { ComponentCode } from "@/lib/db/componentCode/types"

declare namespace ComponentCodeApi {
  // list request
  export interface listRequest {
    page: number
    pageSize: number
    searchKeyword?: string
    filterField?: "all" | "name" | "description"
  }
  export interface listResponse {
    data: Pick<ComponentCode, "_id" | "name" | "description"> &
      {
        latestVersionCode: string
      }[]
    total: number
  }
  // detail request
  export interface detailRequest {
    id: string
  }
  // detail response
  export interface detailResponse {
    data: Pick<ComponentCode, "_id" | "name" | "description" | "versions">
  }
}
