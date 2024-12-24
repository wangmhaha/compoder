"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AppHeader } from "@/components/biz/AppHeader"
import { ChatInput } from "@/components/biz/ChatInput"
import { CodegenGuide } from "@/components/biz/CodegenGuide"
import { ComponentCodeFilterContainer } from "@/components/biz/ComponentCodeFilterContainer"
import { ComponentCodeList } from "@/components/biz/ComponentCodeList"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import TldrawEdit from "@/components/biz/TldrawEdit/TldrawEdit"
import {
  useCodegenDetail,
  useComponentCodeList,
} from "./server-store/selectors"
import { useState } from "react"
import { useCreateComponentCode } from "./server-store/mutations"
import { Prompt, PromptImage } from "@/lib/db/componentCode/types"

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

  const [chatValue, setChatValue] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createComponentMutation = useCreateComponentCode()

  const handleChatSubmit = async () => {
    if (!chatValue.trim() && images.length === 0) return
    setIsSubmitting(true)
    const prompts: Prompt[] = [
      { text: chatValue, type: "text" },
      ...images.map(
        image =>
          ({
            image,
            type: "image",
          } as PromptImage),
      ),
    ]

    try {
      const res = await createComponentMutation.mutateAsync({
        prompt: prompts,
        codegenId: params.codegenId,
      })
      console.log(res)
      const reader = res?.getReader()
      const decoder = new TextDecoder()
      let content = ""
      while (true) {
        const { done, value } = await reader?.read()
        if (done) break
        content += decoder.decode(value)
        console.log(content)
      }
      console.log(content)

      setChatValue("")
      setImages([])
    } catch (error) {
      console.error("Failed to create component:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageRemove = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

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
            value={chatValue}
            onChange={setChatValue}
            onSubmit={handleChatSubmit}
            actions={[
              <TooltipProvider key="draw-image">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <TldrawEdit
                        onSubmit={imageData => {
                          setImages(prev => [...prev, imageData])
                        }}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Draw An Image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>,
            ]}
            images={images}
            onImageRemove={handleImageRemove}
            loading={isSubmitting}
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
