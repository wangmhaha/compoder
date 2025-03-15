import { ErrorInfo } from "react"

import { ReactNode } from "react"

export interface ErrorBoundaryProps {
  children: ReactNode
  onError: (errorMessage: string) => void
  files: {
    [key: string]: string
  }
}

export interface ErrorBoundaryState {
  hasError: boolean
  errorMessage?: string | null
  errorInfo?: ErrorInfo | null
}
