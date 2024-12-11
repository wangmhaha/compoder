import { AppSidebar } from "./components/FileSidebar"
import { ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"
import { CodeIDEProps, FileNode } from "./interface"
import { Editor } from "@monaco-editor/react"
import { FileProvider, useFile } from "./context/FileContext"
import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

function EditorToast({
  visible,
  onReset,
  onSave,
}: {
  visible: boolean
  onReset: () => void
  onSave: () => void
}) {
  if (!visible) return null

  return (
    <div
      className={cn(
        "fixed md:absolute bottom-4 right-4 z-50",
        "bg-background border rounded-lg shadow-lg",
        "p-4 min-w-[300px] max-w-[calc(100%-2rem)]",
        "mx-auto left-4 md:left-auto",
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">Unsaved Changes</h4>
        </div>
        <p className="text-sm text-muted-foreground">
          You have unsaved changes in your files.
        </p>
        <div className="flex gap-2 justify-end mt-2">
          <Button variant="outline" size="sm" onClick={onReset}>
            Reset
          </Button>
          <Button size="sm" onClick={onSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

// 创建一个内部组件来使用 useSidebar
function CodeIDEContent({ readOnly }: CodeIDEProps) {
  const { state, toggleSidebar } = useSidebar()
  const { theme } = useTheme()
  const {
    currentFile,
    updateFileContent,
    resetChanges,
    saveChanges,
    initialFiles,
    addUnsavedFile,
    removeUnsavedFile,
    unsavedFiles,
  } = useFile()
  const [showToast, setShowToast] = useState(false)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  // 修改检查文件是否有更改的辅助函数
  const findFileById = (
    nodes: FileNode[],
    id: string,
  ): FileNode | undefined => {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children) {
        const found = findFileById(node.children, id)
        if (found) return found
      }
    }
    return undefined
  }

  const checkForChanges = (fileId: string, newValue: string) => {
    const initialFile = findFileById(initialFiles, fileId)
    return initialFile && initialFile.content !== newValue
  }

  // 更新 handleEditorChange 处理函数
  const handleEditorChange = (value: string | undefined) => {
    if (currentFile && value !== undefined) {
      updateFileContent(currentFile.id, value)

      // 检查当前文件是否有未保存的更改
      const hasChanges = checkForChanges(currentFile.id, value)

      if (hasChanges) {
        addUnsavedFile(currentFile.id)
      } else {
        removeUnsavedFile(currentFile.id)
      }
    }
  }

  useEffect(() => {
    if (unsavedFiles.size > 0) {
      setShowToast(true)
    } else {
      setShowToast(false)
    }
  }, [unsavedFiles.size])

  console.log("theme", theme)

  return (
    <div className="flex h-full w-full overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col w-full min-w-0">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 -ml-1"
            onClick={toggleSidebar}
          >
            {state === "expanded" ? (
              <ChevronsLeft className="h-4 w-4" />
            ) : (
              <ChevronsRight className="h-4 w-4" />
            )}
          </Button>
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">components</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">ui</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>button.tsx</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex-1 min-h-0 w-full overflow-hidden">
          {currentFile ? (
            <>
              <div
                ref={editorContainerRef}
                className="h-full w-full relative overflow-hidden"
              >
                <Editor
                  height="100%"
                  width="100%"
                  language={currentFile.language || "typescript"}
                  value={currentFile.content}
                  theme={theme === "dark" ? "vs-dark" : "light"}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    readOnly: readOnly,
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                  }}
                  onChange={handleEditorChange}
                />
              </div>
              <EditorToast
                visible={showToast}
                onReset={resetChanges}
                onSave={saveChanges}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a file to view its content
            </div>
          )}
        </div>
      </SidebarInset>
    </div>
  )
}

// 主组件包装 SidebarProvider
export function CodeIDE(props: CodeIDEProps) {
  return (
    <SidebarProvider>
      <FileProvider initialFiles={props.data}>
        <CodeIDEContent {...props} />
      </FileProvider>
    </SidebarProvider>
  )
}
