"use client"
import { useState } from "react"
import { AppHeader } from "@/components/biz/AppHeader"
import { useParams } from "next/navigation"
import { ComponentCodeVersionsContainer } from "@/components/biz/ComponentCodeVersionsContainer"
import { CodeIDE, FileNode } from "@/components/biz/CodeIDE"
import { sampleData } from "@/components/biz/CodeIDE/mock"

export default function ComponentPage() {
  const params = useParams()
  const [activeVersion, setActiveVersion] = useState(1)
  return (
    <div>
      {/* AppHeader */}
      <AppHeader
        breadcrumbs={[
          { label: "Codegen List", href: "/main/codegen" },
          {
            label: "Codegen Detail",
            href: `/main/codegen/${params.codegenId}`,
          },
          { label: "Component Detail" },
        ]}
      />
      <div className="h-[calc(100vh-100px)]">
        <ComponentCodeVersionsContainer
          versions={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
          activeVersion={activeVersion}
          bubbleContent="This is version 1 content"
          children={
            <CodeIDE
              data={sampleData}
              onSave={async (files: FileNode[]) => {
                await new Promise(resolve => setTimeout(resolve, 1000))
                console.log("Files saved:", files)
              }}
              codeRenderer={<div>Code renderer</div>}
            />
          }
          onVersionChange={setActiveVersion}
        />
      </div>
    </div>
  )
}
