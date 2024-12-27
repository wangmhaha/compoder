import { useInfiniteQuery, QueryKey } from "@tanstack/react-query"
import { getCodegenList } from "@/app/services/codegen/codegen.service"
import { CodegenApi } from "@/app/api/codegen/types"
import { JobItem } from "@/components/biz/CodegenList/interface"

export const useGetCodegenList = (
  params: Omit<CodegenApi.ListRequest, "page">,
) => {
  return useInfiniteQuery<
    CodegenApi.ListResponse,
    Error,
    {
      data: JobItem[]
      total: number
    },
    QueryKey,
    number
  >({
    queryKey: ["getCodegenList", params],
    initialPageParam: 1,
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getCodegenList({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.total / (params.pageSize || 10))
      const nextPage = allPages.length + 1
      return nextPage <= totalPages ? nextPage : undefined
    },
    select: data => ({
      data: data.pages.flatMap(page =>
        page.data.map(item => ({
          id: String(item._id),
          title: item.title,
          description: item.description,
          fullStack: item.fullStack,
        })),
      ),
      total: data.pages[0]?.total ?? 0,
    }),
  })
}
