"use client"

import { AppHeader } from "@/components/biz/AppHeader"
import { ChatInput } from "@/components/biz/ChatInput"
import { CodegenGuide } from "@/components/biz/CodegenGuide"
import { ComponentCodeFilterContainer } from "@/components/biz/ComponentCodeFilterContainer"
import { ComponentCodeList } from "@/components/biz/ComponentCodeList"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  useCodegenDetail,
  useComponentCodeList,
} from "./server-store/selectors"
import { useState } from "react"

export default function CodegenDetailPage({
  params,
}: {
  params: { codegenId: string }
}) {
  const { data: codegenDetail, isLoading } = useCodegenDetail(params.codegenId)

  const [currentPage, setCurrentPage] = useState(1)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [filterField, setFilterField] = useState<
    "all" | "name" | "description"
  >("all")

  const { data: componentCodeData, isLoading: isComponentLoading } =
    useComponentCodeList({
      page: currentPage,
      pageSize: 10,
      searchKeyword,
      filterField,
    })

  return (
    <div>
      <AppHeader
        breadcrumbs={[
          { label: "Codegen List", href: "/main/codegen" },
          { label: "Codegen Detail" },
        ]}
      />
      <ScrollArea className="h-[calc(100vh-88px)]">
        <div className="w-full max-w-4xl pt-12 pb-12 px-6 flex flex-col mx-auto">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <CodegenGuide
              prompts={codegenDetail?.prompts || []}
              name={codegenDetail?.name || ""}
            />
          )}
          <ChatInput
            className="mt-6"
            value=""
            onSubmit={() => console.log("Submitted")}
          />
        </div>
        <div className="w-full mx-auto px-6 max-w-screen-xl">
          <p className="text-lg font-bold mb-4">Component List</p>
          <ComponentCodeFilterContainer
            total={componentCodeData?.total || 0}
            currentPage={currentPage}
            searchKeyword={searchKeyword}
            filterField={filterField}
            onPageChange={setCurrentPage}
            onSearchChange={setSearchKeyword}
            onFilterFieldChange={setFilterField}
          >
            {isComponentLoading ? (
              <div>Loading components...</div>
            ) : (
              <ComponentCodeList
                items={componentCodeData?.items || []}
                onEditClick={id => console.log("Edit clicked:", id)}
                onDeleteClick={id => console.log("Delete clicked:", id)}
              />
            )}
          </ComponentCodeFilterContainer>
        </div>
      </ScrollArea>
    </div>
  )
}
