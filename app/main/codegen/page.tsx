"use client"
import { CodegenFilterContainer } from "@/components/biz/CodegenFilterContainer"
import { CodegenList } from "@/components/biz/CodegenList"
import { useGetCodegenList } from "./server-store/selectors"
import { useEffect, useState } from "react"
import { JobItem, StackType } from "@/components/biz/CodegenList/interface"
import { flushSync } from "react-dom"
import { AppHeader } from "@/components/biz/AppHeader"
import { useRouter } from "next/navigation"

export default function Codegen() {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState<{
    page?: number
    pageSize?: number
    selectedStack?: StackType | "All"
    searchKeyword?: string
  }>({
    page: 1,
    pageSize: 10,
    selectedStack: undefined,
    searchKeyword: undefined,
  })

  const { isLoading, refetch } = useGetCodegenList({
    page: searchParams.page || 1,
    pageSize: searchParams.pageSize || 10,
    name: searchParams.searchKeyword,
    fullStack:
      searchParams.selectedStack === "All"
        ? undefined
        : searchParams.selectedStack,
  })

  const [items, setItems] = useState<JobItem[]>([])
  const [total, setTotal] = useState(0)

  const requestNewData = async () => {
    const { data } = await refetch()
    setItems(data?.data ?? [])
    setTotal(data?.total ?? 0)
  }

  const requestMoreData = async () => {
    const { data } = await refetch()
    setItems(prev => [...prev, ...(data?.data ?? [])])
    setTotal(data?.total ?? 0)
  }

  useEffect(() => {
    requestNewData()
  }, [])

  const handleStackChange = (stack: StackType) => {
    const newSearchParams = {
      ...searchParams,
      selectedStack: stack,
      page: 1,
    }
    flushSync(() => {
      setSearchParams(newSearchParams)
    })
    requestNewData()
  }

  const handleSearchChange = (keyword: string) => {
    flushSync(() => {
      setSearchParams(prev => ({ ...prev, searchKeyword: keyword, page: 1 }))
    })
    requestNewData()
  }

  const handleLoadMore = () => {
    flushSync(() => {
      setSearchParams(prev => ({
        ...prev,
        page: prev.page ? prev.page + 1 : 1,
      }))
    })
    requestMoreData()
  }

  const handleItemClick = (id: string) => {
    router.push(`/main/codegen/${id}`)
  }

  return (
    <div>
      <AppHeader breadcrumbs={[{ label: "Codegen List" }]} />
      <CodegenFilterContainer
        selectedStack={searchParams.selectedStack}
        onStackChange={handleStackChange}
        onSearchChange={handleSearchChange}
        onLoadMore={handleLoadMore}
        isLoading={isLoading}
        hasMore={Boolean(total && total > items.length)}
      >
        <CodegenList items={items} onItemClick={handleItemClick} />
      </CodegenFilterContainer>
    </div>
  )
}
