export interface HtmlRendererProps {
  html: string
  onError: (errorMessage: string) => void
  onSuccess: () => void
}
