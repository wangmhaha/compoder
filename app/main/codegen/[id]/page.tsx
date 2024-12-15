"use client"

import { AppHeader } from "@/components/biz/AppHeader"
import { ChatInput } from "@/components/biz/ChatInput"
import { CodegenGuide } from "@/components/biz/CodegenGuide"
import { ComponentCodeFilterContainer } from "@/components/biz/ComponentCodeFilterContainer"
import { ComponentCodeList } from "@/components/biz/ComponentCodeList"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function CodegenDetailPage() {
  return (
    <div>
      <AppHeader
        breadcrumbs={[
          { label: "Codegen List", href: "/main/codegen" },
          { label: "Codegen Detail" },
        ]}
      />
      <ScrollArea className="h-[calc(100vh-88px)]">
        <div className="w-full max-w-4xl pt-12 pb-24 px-6 flex flex-col mx-auto">
          <CodegenGuide
            prompts={[
              {
                title: "Write a to-do list for a personal project or task",
                onClick: () => console.log("Clicked todo list prompt"),
              },
              {
                title: "Generate an email to reply to a job offer",
                onClick: () => console.log("Clicked email prompt"),
              },
            ]}
            name="Mui Coder"
            subtitle="Choose from our curated list of AI prompts"
          />
          <ChatInput
            className="mt-6"
            value=""
            onSubmit={() => console.log("Submitted")}
          />
        </div>
        <div className="w-full mx-auto px-6 max-w-screen-xl">
          <p className="text-lg font-bold mb-4">Component List</p>
          <ComponentCodeFilterContainer
            total={10}
            currentPage={1}
            searchKeyword="theme"
            filterField="all"
            onPageChange={() => console.log("Page changed")}
            onSearchChange={() => console.log("Search changed")}
            onFilterFieldChange={() => console.log("Filter field changed")}
          >
            <ComponentCodeList
              items={[
                {
                  id: "1",
                  title: "Component 1",
                  description: "Description 1",
                },
              ]}
              onEditClick={id => console.log("Edit clicked:", id)}
              onDeleteClick={id => console.log("Delete clicked:", id)}
            />
          </ComponentCodeFilterContainer>
        </div>
      </ScrollArea>
    </div>
  )
}
