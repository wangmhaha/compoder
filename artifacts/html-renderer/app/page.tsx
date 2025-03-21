"use client"

import React, { useEffect, useState } from "react"
import { HtmlRenderer } from "./HtmlRenderer"

interface ArtifactData {
  html: string
}

type MessageType = "artifacts"

interface MessagePayload {
  type: MessageType
  data: ArtifactData
}

const HomePage: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>("")
  const [_, setKey] = useState<number>(0)

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, data }: MessagePayload = event.data
      if (type === "artifacts") {
        setHtmlContent(data.html || "")
        setKey(prevKey => prevKey + 1) // Update the key to force remount
      }
    }

    window.addEventListener("message", handleMessage as EventListener)
    window.parent.postMessage("IFRAME_LOADED", "*")
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("message", handleMessage as EventListener)
    }
  }, [])

  // Add a function to handle error events
  const handleError = (errorMessage: string) => {
    // Send error message to parent window
    window.parent.postMessage(
      {
        type: "artifacts-error",
        errorMessage,
      },
      "*",
    )
  }

  const handleSuccess = () => {
    window.parent.postMessage(
      {
        type: "artifacts-success",
      },
      "*",
    )
  }

  return (
    <div>
      {htmlContent && (
        <HtmlRenderer
          html={htmlContent}
          onError={handleError}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}

export default HomePage
