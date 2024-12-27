import * as React from "react"
import { useFile } from "../context/FileContext"
import { FileTree } from "./FileTree"

export function AppSidebar() {
  const { handleFileSelect, files } = useFile()

  return (
    <div className="h-full overflow-hidden bg-background">
      <div className="flex flex-col h-full">
        {/* 标题部分 */}
        <div className="px-3 py-2 border-b">
          <h2 className="text-sm font-semibold">Files</h2>
        </div>

        {/* 文件树部分 */}
        <div className="flex-1 overflow-auto p-2">
          <div className="space-y-1">
            {files.map((item, index) => (
              <FileTree
                key={index}
                item={item}
                onFileClick={handleFileSelect}
                variant="sidebar"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
