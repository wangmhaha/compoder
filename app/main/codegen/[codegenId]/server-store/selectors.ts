import { useQuery } from "@tanstack/react-query"
import { getCodegenDetail } from "@/app/services/codegen/codegen.service"
import {
  getComponentCodeDetail,
  getComponentCodeList,
} from "@/app/services/componentCode/componentCode.service"
import { CodegenApi } from "@/app/api/codegen/types"
import { ComponentCodeApi } from "@/app/api/componentCode/type"
import { ComponentItem } from "@/components/biz/ComponentCodeList/interface"
import { transformComponentArtifactFromXml } from "@/lib/xml-message-parser/parser"

export const useCodegenDetail = (id: string) => {
  return useQuery<
    CodegenApi.DetailResponse,
    Error,
    {
      name: string
      prompts: Array<{
        title: string
        onClick: () => void
      }>
      codeRendererUrl: string
    }
  >({
    queryKey: ["codegen-detail", id],
    queryFn: () => getCodegenDetail({ id }),
    select: data => ({
      name: data.data.title,
      prompts: data.data.guides.map(prompt => ({
        title: prompt,
        onClick: () => console.log(`Clicked prompt: ${prompt}`),
      })),
      codeRendererUrl: data.data.codeRendererUrl,
    }),
  })
}

export const useComponentCodeList = (params: ComponentCodeApi.listRequest) => {
  return useQuery<
    ComponentCodeApi.listResponse,
    Error,
    {
      items: ComponentItem[]
      total: number
    }
  >({
    queryKey: ["componentCodeList", params],
    queryFn: () =>
      getComponentCodeList({
        ...params,
        pageSize: params.pageSize || 10,
      }),
    select: (
      response,
    ): {
      items: ComponentItem[]
      total: number
    } => ({
      items: response.data.map(item => ({
        id: item._id.toString(),
        title: item.name,
        description: item.description,
        code: transformComponentArtifactFromXml(item.latestVersionCode).codes,
      })),
      total: response.total,
    }),
  })
}

export const useComponentCodeDetail = (id: string) => {
  return useQuery<
    ComponentCodeApi.detailResponse,
    Error,
    ComponentCodeApi.detailResponse["data"]
  >({
    queryKey: ["componentCodeDetail", id],
    queryFn: () => getComponentCodeDetail({ id }),
    select: response => response.data,
    staleTime: 0,
  })
}
