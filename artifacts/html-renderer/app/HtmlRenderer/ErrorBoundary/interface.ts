import { ErrorInfo, ReactNode } from "react"

export interface ErrorBoundaryProps {
  children: ReactNode
  onError: (errorMessage: string) => void
  html?: string
}

export interface ErrorBoundaryState {
  hasError: boolean
  errorMessage?: string | null
  errorInfo?: ErrorInfo | null
}
