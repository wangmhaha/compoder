export interface CodeFile {
  filePath: string
  content: string
}

export interface CodeRendererProps {
  codeRendererServer: string
  onFixError: (errorMessage: string) => void
  codes: {
    [key: string]: string
  }
  className?: string
}
