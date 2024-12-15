import { useQuery } from "@tanstack/react-query"
import { getCodegenList } from "@/app/services/codegen/codegen.service"
import { CodegenApi } from "@/app/api/codegen/types"
import { JobItem } from "@/components/biz/CodegenList/interface"

export const useGetCodegenList = (params: CodegenApi.ListRequest) => {
  return useQuery<
    CodegenApi.ListResponse,
    Error,
    {
      data: JobItem[]
      total: number
    }
  >({
    queryKey: ["getCodegenList", params],
    queryFn: () => getCodegenList(params),
    select: data => ({
      data: data.data.map(item => ({
        id: String(item._id),
        title: item.title,
        description: item.description,
        fullStack: item.fullStack,
      })),
      total: data.total,
    }),
    enabled: false,
  })
}
