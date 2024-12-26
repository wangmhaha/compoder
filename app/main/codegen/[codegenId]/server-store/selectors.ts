import { useQuery } from "@tanstack/react-query"
import { getCodegenDetail } from "@/app/services/codegen/codegen.service"
import { getComponentCodeList } from "@/app/services/componentCode/componentCode.service"
import { CodegenApi } from "@/app/api/codegen/types"
import { ComponentCodeApi } from "@/app/api/componentCode/type"

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
    }),
  })
}

export const useComponentCodeList = (params: ComponentCodeApi.listRequest) => {
  return useQuery<
    ComponentCodeApi.listResponse,
    Error,
    {
      items: { id: string; title: string; description: string }[]
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
      items: { id: string; title: string; description: string }[]
      total: number
    } => ({
      items: response.data.map(item => ({
        id: item._id.toString(),
        title: item.name,
        description: item.description,
      })),
      total: response.total,
    }),
  })
}
