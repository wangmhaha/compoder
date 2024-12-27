"use client"
import { useState, useEffect } from "react"
import { AppHeader } from "@/components/biz/AppHeader"
import { useParams } from "next/navigation"
import { ComponentCodeVersionsContainer } from "@/components/biz/ComponentCodeVersionsContainer"
import { CodeIDE, FileNode } from "@/components/biz/CodeIDE"
import { sampleData } from "@/components/biz/CodeIDE/mock"
import { ChatInput } from "@/components/biz/ChatInput"
import { useSidebar } from "@/components/ui/sidebar"

export default function ComponentPage() {
  const params = useParams()
  const [activeVersion, setActiveVersion] = useState(1)
  const { setOpen } = useSidebar()
  useEffect(() => {
    setOpen(false)
  }, [])

  return (
    <div className="h-screen relative">
      <AppHeader
        showSidebarTrigger={false}
        breadcrumbs={[
          { label: "Codegen", href: "/main/codegen" },
          {
            label: "Codegen Detail",
            href: `/main/codegen/${params.codegenId}`,
          },
          { label: "Component Detail" },
        ]}
      />
      <div className="h-[calc(100%-200px)]">
        <ComponentCodeVersionsContainer
          versions={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]}
          activeVersion={activeVersion}
          bubbleContent="This is version 1 content"
          onVersionChange={setActiveVersion}
        >
          <div className="h-[calc(100%-45px)]">
            <CodeIDE
              data={sampleData}
              onSave={async (files: FileNode[]) => {
                await new Promise(resolve => setTimeout(resolve, 1000))
                console.log("Files saved:", files)
              }}
              codeRenderer={<div>Code renderer</div>}
            />
          </div>
        </ComponentCodeVersionsContainer>
      </div>
      <ChatInput
        className="absolute left-1/2 -translate-x-1/2 bottom-6 w-2/3 z-50"
        value={""}
        onChange={() => {}}
        onSubmit={() => {}}
        loading={false}
        loadingSlot={<div>Loading slot</div>}
        actions={[]}
      />
    </div>
  )
}
