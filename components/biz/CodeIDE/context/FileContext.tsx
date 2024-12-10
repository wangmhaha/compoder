import React, { createContext, useContext, useState } from "react"
import type { FileNode } from "../interface"
import { useToast } from "@/hooks/use-toast"

interface FileContextType {
  files: FileNode[]
  currentFile: FileNode | null
  setFiles: (files: FileNode[]) => void
  setCurrentFile: (file: FileNode | null) => void
  handleFileSelect: (file: FileNode) => void
  updateFileContent: (fileId: string, content: string) => void
  hasUnsavedChanges: boolean
  resetChanges: () => void
  saveChanges: () => void
  initialFiles: FileNode[]
}

const FileContext = createContext<FileContextType | undefined>(undefined)

export function FileProvider({
  children,
  initialFiles,
}: {
  children: React.ReactNode
  initialFiles: FileNode[]
}) {
  const { toast } = useToast()
  const [files, setFiles] = useState<FileNode[]>(initialFiles)
  const [currentFile, setCurrentFile] = useState<FileNode | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [originalFiles, setOriginalFiles] = useState<FileNode[]>(initialFiles)

  const handleFileSelect = (file: FileNode) => {
    if (file.content) {
      setCurrentFile(file)
    }
  }

  const updateFileContent = (fileId: string, content: string) => {
    setFiles(prevFiles => {
      const updateFileNode = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.id === fileId) {
            return { ...node, content }
          }
          if (node.children) {
            return { ...node, children: updateFileNode(node.children) }
          }
          return node
        })
      }
      return updateFileNode(prevFiles)
    })

    if (currentFile?.id === fileId) {
      setCurrentFile(prev => (prev ? { ...prev, content } : null))
    }
    setHasUnsavedChanges(true)
  }

  const resetChanges = () => {
    setFiles(originalFiles)
    if (currentFile) {
      const originalFile = findFileById(originalFiles, currentFile.id)
      setCurrentFile(originalFile)
    }
    setHasUnsavedChanges(false)
    toast({
      title: "Changes Reset",
      description: "Your changes have been reset to the last saved version.",
      duration: 3000,
    })
  }

  const saveChanges = () => {
    setOriginalFiles(files)
    setHasUnsavedChanges(false)
    toast({
      title: "Changes Saved",
      description: "Your changes have been saved successfully.",
      duration: 3000,
    })
  }

  const findFileById = (nodes: FileNode[], id: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children) {
        const found = findFileById(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  return (
    <FileContext.Provider
      value={{
        files,
        currentFile,
        setFiles,
        setCurrentFile,
        handleFileSelect,
        updateFileContent,
        hasUnsavedChanges,
        resetChanges,
        saveChanges,
        initialFiles,
      }}
    >
      {children}
    </FileContext.Provider>
  )
}

export function useFile() {
  const context = useContext(FileContext)
  if (context === undefined) {
    throw new Error("useFile must be used within a FileProvider")
  }
  return context
}
