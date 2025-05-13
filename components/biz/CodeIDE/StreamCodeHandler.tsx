import { startTransition, useEffect, useRef } from "react"
import { FileContextType, useFile } from "./context/FileContext"
import { parseStreamingArtifact } from "@/lib/xml-message-parser/artifact-stream-parser"
import { FileNode, StreamCodeIDEProps } from "./interface"

interface ParseStatus {
  content: string
  status: "beforeArtifactStart" | "artifactStart"
}

export const StreamCodeHandler = ({
  isStreaming,
  readableStream,
  // 只输出 流中 Artifact之前的内容，也就是推理过程
  onCompoderThinkingProcess,
  children,
}: {
  isStreaming?: boolean
  readableStream?: ReadableStream
  children: React.ReactNode
  onCompoderThinkingProcess?: StreamCodeIDEProps["onCompoderThinkingProcess"]
}) => {
  const { currentFile, setFiles, setCurrentFile, updateFileContent } = useFile()

  const parseStatusRef = useRef<ParseStatus>({
    content: "",
    status: "beforeArtifactStart",
  })
  const handleFlagRef = useRef(false)
  const currentFileRef = useRef<FileNode | null>(null)
  // updateFileContent方法会形成闭包，所以需要用ref来保存
  const currentUpdateFileContentRef = useRef<
    FileContextType["updateFileContent"] | null
  >(null)
  const currentOnThinkingProcess = useRef<
    StreamCodeIDEProps["onCompoderThinkingProcess"]
  >(onCompoderThinkingProcess)

  currentUpdateFileContentRef.current = updateFileContent
  currentFileRef.current = currentFile
  currentOnThinkingProcess.current = onCompoderThinkingProcess

  useEffect(() => {
    if (!isStreaming || !readableStream || handleFlagRef.current) return

    handleFlagRef.current = true
    parseStreamingArtifact({
      stream: readableStream,
      onChunk(chunk) {
        if (parseStatusRef.current.status !== "beforeArtifactStart") return
        parseStatusRef.current.content += chunk
        currentOnThinkingProcess.current?.(parseStatusRef.current.content)
      },
      onArtifactStart() {
        parseStatusRef.current.status = "artifactStart"
        currentOnThinkingProcess.current?.("")
      },
      onArtifactEnd(artifact) {
        setFiles(artifact.files)
        handleFlagRef.current = false
      },
      onFileStart(file, artifact) {
        setFiles(artifact.files)
        setCurrentFile(file)
      },
      onFileContent(content, file) {
        if (!currentFileRef.current || currentFileRef.current.id !== file.id)
          return
        startTransition(() =>
          currentUpdateFileContentRef.current?.(file.id, content),
        )
      },
      onError() {
        handleFlagRef.current = false
        parseStatusRef.current = {
          content: "",
          status: "beforeArtifactStart",
        }
      },
      onEnd() {
        handleFlagRef.current = false
        parseStatusRef.current = {
          content: "",
          status: "beforeArtifactStart",
        }
      },
    })
  }, [isStreaming, readableStream])

  return children
}
