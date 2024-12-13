import { FC, useCallback, useEffect, useRef, useState } from "react"
import type { CodeRendererProps } from "./interface"

export const CodeRenderer: FC<CodeRendererProps> = ({
  codeRendererServer,
  onFixError,
  codes,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isIframeLoaded, setIsIframeLoaded] = useState(false)

  const sendMessage = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        {
          type: "artifacts",
          data: {
            codeType: "tsx",
            codeContent: codes,
          },
        },
        codeRendererServer,
      )
    }
  }, [codes, codeRendererServer])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "IFRAME_LOADED") {
        sendMessage()
        setIsIframeLoaded(true)
      }
      if (event.data.type === "retry") {
        onFixError(event.data.data.errorMessage)
      }
    }

    window.addEventListener("message", handleMessage, false)

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [sendMessage, onFixError])

  useEffect(() => {
    if (isIframeLoaded) {
      sendMessage()
    }
  }, [codes, isIframeLoaded, sendMessage])

  return (
    <div className="w-full h-full p-6">
      <iframe
        ref={iframeRef}
        src={`${codeRendererServer}`}
        title="Code Preview"
        className="w-full h-full border-0"
        onLoad={() => setIsIframeLoaded(true)}
      />
    </div>
  )
}
