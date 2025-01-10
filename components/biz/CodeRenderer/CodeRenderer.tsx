import { FC, useCallback, useEffect, useRef, useState } from "react"
import type { CodeRendererProps } from "./interface"
import { cn } from "@/lib/utils"
import { ErrorToast } from "./ErrorToast"

export const CodeRenderer: FC<CodeRendererProps> = ({
  codeRendererServer,
  onFixError,
  className,
  codes,
  notShowErrorToast,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isIframeLoaded, setIsIframeLoaded] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const sendMessage = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        {
          type: "artifacts",
          data: {
            files: codes,
            entryFile: "App.tsx",
          },
        },
        codeRendererServer,
      )
    }
  }, [codes, codeRendererServer])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) {
        return
      }

      if (event.data === "IFRAME_LOADED") {
        sendMessage()
        setIsIframeLoaded(true)
      }
      if (event.data.type === "artifacts-error") {
        setErrorMessage(event.data.errorMessage)
        setShowErrorToast(true)
      }
      if (event.data.type === "artifacts-success") {
        setErrorMessage("")
        setShowErrorToast(false)
      }
    }

    window.addEventListener("message", handleMessage, false)

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [sendMessage, onFixError])

  useEffect(() => {
    if (isIframeLoaded && !!codes) {
      sendMessage()
    }
  }, [codes, isIframeLoaded, sendMessage])

  const handleFixError = () => {
    onFixError?.(errorMessage)
    setShowErrorToast(false)
  }

  return (
    <div className={cn("w-full h-full p-6 relative", className)}>
      <iframe
        ref={iframeRef}
        src={`${codeRendererServer}`}
        title="Code Preview"
        className="w-full h-full border-0"
        onLoad={() => setIsIframeLoaded(true)}
      />
      {!notShowErrorToast && showErrorToast && (
        <ErrorToast message={errorMessage} onFix={handleFixError} />
      )}
    </div>
  )
}
