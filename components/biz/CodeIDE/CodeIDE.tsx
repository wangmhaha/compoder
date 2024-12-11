import { AppSidebar } from "./components/FileSidebar"
import { ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
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
import { useTheme } from "next-themes"
import { BreadcrumbPopover } from "./components/BreadcrumbPopover"
import { EditorToast } from "./components/EditorToast"

// Add this helper function before the CodeIDEContent component
function getFilePath(
  nodes: FileNode[],
  targetId: string,
  path: FileNode[] = [],
): FileNode[] | null {
  for (const node of nodes) {
    // Try current path
    if (node.id === targetId) {
      return [...path, node]
    }

    // If has children, recursively search
    if (node.children) {
      const foundPath = getFilePath(node.children, targetId, [...path, node])
      if (foundPath) {
        return foundPath
      }
    }
  }
  return null
}

// 创建一个内部组件来使用 useSidebar
function CodeIDEContent({ readOnly, onSave }: CodeIDEProps) {
  const { state, toggleSidebar } = useSidebar()
  const { theme } = useTheme()
  const {
    currentFile,
    updateFileContent,
    resetChanges,
    saveChanges,
    originalFiles,
    addUnsavedFile,
    removeUnsavedFile,
    unsavedFiles,
    files,
  } = useFile()
  const [showToast, setShowToast] = useState(false)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Add this to compute the current file path
  const currentFilePath = currentFile
    ? getFilePath(originalFiles, currentFile.id)
    : null

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
    const initialFile = findFileById(originalFiles, fileId)
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

  useEffect(() => {
    if (currentFile) {
      console.log("Current file language:", currentFile.language)
    }
  }, [currentFile])

  // 修改处理保存的逻辑
  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(files)
      saveChanges() // 只有在外部 onSave 成功后才调用内部的 saveChanges
    } catch (error) {
      console.error("Failed to save:", error)
    } finally {
      setIsSaving(false)
    }
  }

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
              {currentFilePath ? (
                currentFilePath.map((node, index) => (
                  <BreadcrumbItem key={node.id}>
                    {index === currentFilePath.length - 1 ? (
                      <BreadcrumbPage>{node.name}</BreadcrumbPage>
                    ) : (
                      <>
                        <BreadcrumbPopover
                          node={node}
                          popoverNode={
                            index === 0
                              ? {
                                  id: "originalFiles",
                                  name: "root",
                                  children: originalFiles,
                                }
                              : currentFilePath[index - 1]
                          }
                        />
                        <BreadcrumbSeparator />
                      </>
                    )}
                  </BreadcrumbItem>
                ))
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbPage>No file selected</BreadcrumbPage>
                </BreadcrumbItem>
              )}
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
                  language={currentFile.language ?? "typescript"}
                  value={currentFile.content}
                  theme={theme === "dark" ? "vs-dark" : "light"}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    readOnly: readOnly,
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                  }}
                  beforeMount={monaco => {
                    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
                      {
                        jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
                        jsxFactory: "React.createElement",
                        reactNamespace: "React",
                        allowNonTsExtensions: true,
                        allowJs: true,
                        target: monaco.languages.typescript.ScriptTarget.Latest,
                      },
                    )
                  }}
                  onChange={handleEditorChange}
                />
              </div>
              <EditorToast
                visible={showToast}
                onReset={resetChanges}
                onSave={handleSave}
                isSaving={isSaving}
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
