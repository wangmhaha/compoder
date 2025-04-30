import { FileNode } from "@/components/biz/CodeIDE/interface"
import { Codes, getCodesFromFileNodes } from "./parser"
import { StreamParser } from "./stream-parser"

export interface Artifact {
  componentName: string | null
  files: FileNode[]
  codes: Codes
  entryFile?: string
}

// 对与 componentCode，当前只解析了 ComponentArtifact 内非嵌套的 ComponentFile
export const parseStreamingArtifact = ({
  stream,
  onArtifactStart,
  onArtifactEnd,
  onFileStart,
  onFileEnd,
  onFileContent,
  onError,
  onEnd,
  onChunk,
}: {
  stream: ReadableStream
  onArtifactStart?: (artifact: Artifact) => void
  onArtifactEnd?: (artifact: Artifact) => void
  onFileStart?: (file: FileNode, artifact: Artifact) => void
  onFileEnd?: (file: FileNode, artifact: Artifact) => void
  onFileContent?: (content: string, file: FileNode, artifact: Artifact) => void
  onError?: (err: Error) => void
  onEnd?: () => void
  onChunk?: (chunk: string) => void
}) => {
  const parser = new StreamParser({
    strict: false,
    parseAsRawContentTags: ["ComponentFile"],
  })

  let currentArtifact: Artifact | null = null
  let currentFile: FileNode | null = null
  let currentContent = ""

  // 开始标签事件
  parser.onOpenTag = function ({ name, attrs }) {
    if (name === "ComponentArtifact") {
      currentArtifact = {
        componentName: attrs.name as string | null,
        files: [],
        codes: {},
        entryFile: "",
      }
      return onArtifactStart?.(currentArtifact)
    }
    if (name === "ComponentFile") {
      const fileName = attrs.fileName as string
      const isEntryFile = attrs.isEntryFile === "true"
      currentFile = {
        id: fileName,
        name: fileName,
        isEntryFile,
        content: "",
      }
      // 重置内容收集
      currentContent = ""
      if (currentArtifact) {
        if (isEntryFile) {
          currentArtifact.entryFile = fileName
        }
        currentArtifact.files.push(currentFile)
      }
      return onFileStart?.(currentFile, currentArtifact as Artifact)
    }
  }

  // 文本内容事件
  parser.onRawContent = function ({ name }, text) {
    if (name === "ComponentFile" && currentFile) {
      // 解析出ComponentFile标签的内容
      currentContent += text
      return onFileContent?.(
        currentContent,
        currentFile,
        currentArtifact as Artifact,
      )
    }
  }

  parser.onCloseTag = function ({ name }) {
    if (name === "ComponentArtifact" && currentArtifact) {
      currentArtifact.codes = getCodesFromFileNodes(currentArtifact.files)
      onArtifactEnd?.(currentArtifact)
      return (currentArtifact = null)
    }
    if (name === "ComponentFile" && currentFile) {
      currentFile.content = currentContent.trim()
      onFileEnd?.(currentFile, currentArtifact as Artifact)
      currentFile = null
    }
  }
  parser.onError = onError as (err: Error) => void
  parser.onEnd = onEnd as (() => void) | null
  parser.onChunk = onChunk as (chunk: string) => void
  parser.pipe(stream)
}
