import { ComponentCode } from "@/lib/db/componentCode/types"
import { Prompt } from "@/lib/db/componentCode/types"

declare namespace ComponentCodeApi {
  // list request
  export interface listRequest {
    codegenId: string
    page: number
    pageSize: number
    searchKeyword?: string
    filterField?: "all" | "name" | "description"
  }
  export interface listResponse {
    data: Array<
      Pick<ComponentCode, "_id" | "name" | "description"> & {
        latestVersionCode: string
      }
    >
    total: number
  }

  export interface component {
    id: string
    name: string
    code: string
    prompt: Prompt[]
    isInitialized?: boolean
  }

  // detail request
  export interface detailRequest {
    id: string
    codegenId: string
  }
  // detail response
  export interface detailResponse {
    data: Pick<ComponentCode, "_id" | "name" | "description" | "versions"> & {
      codeRendererUrl: string
    }
  }

  // create request
  export interface createRequest {
    codegenId: string
    prompt: Prompt[]
    model: string
    provider: string
  }

  export interface initRequest {
    codegenId: string
    component: component
    prompt: Prompt[]
    model: string
    provider: string
  }

  // create response
  export type createResponse = ReadableStream

  export type initResponse = ReadableStream

  // edit request
  export interface editRequest {
    codegenId: string
    prompt: Prompt[]
    component: component
    model: string
    provider: string
  }

  // edit response
  export type editResponse = ReadableStream

  // save request
  export interface saveRequest {
    id: string
    versionId: string
    code: string
  }

  // delete request
  export interface deleteRequest {
    id: string
  }
}
