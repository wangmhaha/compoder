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
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

// 创建一个内部组件来使用 useSidebar
function CodeIDEContent({ data, readOnly }: CodeIDEProps) {
  const { state, toggleSidebar } = useSidebar()
  const {
    currentFile,
    updateFileContent,
    resetChanges,
    saveChanges,
    initialFiles,
  } = useFile()
  const { toast, dismiss } = useToast()

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

  const checkForChanges = (newValue: string) => {
    if (!currentFile) return false

    const initialFile = findFileById(initialFiles, currentFile.id)
    return initialFile && initialFile.content !== newValue
  }

  // 更新 handleEditorChange 处理函数
  const handleEditorChange = (value: string | undefined) => {
    if (currentFile && value !== undefined) {
      updateFileContent(currentFile.id, value)

      // 检查是否有未保存的更改
      const hasChanges = checkForChanges(value)

      console.log("hasChanges", hasChanges)

      if (hasChanges) {
        // 有更改时显示 toast
        toast({
          title: "Unsaved Changes",
          description: "You have unsaved changes in your file.",
          action: (
            <div className="flex gap-2">
              <ToastAction altText="Reset changes" onClick={resetChanges}>
                Reset
              </ToastAction>
              <ToastAction altText="Save changes" onClick={saveChanges}>
                Save
              </ToastAction>
            </div>
          ),
          duration: Infinity,
          onOpenChange: open => {
            if (!open) resetChanges()
          },
        })
      } else {
        // 没有更改时关闭所有 toast
        dismiss()
      }
    }
  }

  return (
    <>
      <AppSidebar data={data} />
      <SidebarInset>
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
        <div className="flex flex-1 flex-col gap-4">
          {currentFile ? (
            <Editor
              height="90vh"
              language={currentFile.language || "typescript"}
              value={currentFile.content}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                readOnly: readOnly,
              }}
              onChange={handleEditorChange}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a file to view its content
            </div>
          )}
        </div>
      </SidebarInset>
    </>
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
