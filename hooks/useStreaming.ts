import { useState, useCallback } from "react"
import { toast } from "@/hooks/use-toast"
import { transformTryCatchErrorFromXml } from "@/lib/xml-message-parser/parser"

interface UseStreamingContentOptions {
  onSuccess?: (content: string) => void
  onError?: (error: string) => void
  onCancel?: () => void
}

// Define a type that covers different types of streaming responses
type StreamResponse =
  | Response
  | ReadableStream<any>
  | { getReader: () => ReadableStreamDefaultReader<any> }
  | null
  | undefined

export function useStreamingContent(options: UseStreamingContentOptions = {}) {
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const [readableStream, setReadableStream] = useState<ReadableStream<any>>()

  const resetState = useCallback(() => {
    setIsStreaming(false)
    setReadableStream(undefined)
  }, [])

  const cancelStreaming = async () => {
    if (readableStream) {
      try {
        const reader = readableStream.getReader()
        await reader.cancel("Stream canceled by user")
        if (options.onCancel) {
          options.onCancel()
        }
        resetState()
      } catch (error) {
        console.error("Error canceling stream:", error)
      }
    }
  }

  const startStreaming = async <T>(
    asyncFn: () => Promise<StreamResponse> | StreamResponse,
    customHandler?: (content: string) => Promise<T> | T,
  ): Promise<T | string | null> => {
    try {
      // Set streaming state to true
      setIsStreaming(true)

      // Call the async function that returns a readable stream
      const res = await asyncFn()

      if (!res) {
        throw new Error("Failed to get response")
      }
      // Get the stream from the response and store it in state
      let currentStream: ReadableStream<Uint8Array>

      if (res instanceof Response) {
        const body = res.body
        if (!body) {
          throw new Error("Response body is null or undefined")
        }
        currentStream = body
      } else if (res instanceof ReadableStream) {
        currentStream = res
      } else if ("getReader" in res) {
        currentStream = new ReadableStream({
          start(controller) {
            const reader = res.getReader()

            function pump(): any {
              return reader.read().then(({ done, value }) => {
                if (done) {
                  controller.close()
                  return
                }
                controller.enqueue(value)
                return pump()
              })
            }

            return pump()
          },
        })
      } else {
        throw new Error("Response is not a readable stream")
      }
      // 1给外部读取，2更新内部状态
      const [stream1, stream2] = currentStream.tee()

      setReadableStream(stream1)

      const reader = stream2.getReader()
      const decoder = new TextDecoder()
      let content = ""

      // Read from the stream
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        if (typeof value === "string") {
          content += value
        } else {
          const chunk = decoder.decode(value)
          content += chunk
        }
      }
      // Check for errors in the content (XML error format)
      const errorMessage = transformTryCatchErrorFromXml(content)
      if (errorMessage) {
        if (options.onError) {
          options.onError(errorMessage)
        } else {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          })
        }
        return null
      }

      // If a custom handler is provided, call it with the content
      if (customHandler) {
        return await customHandler(content)
      }

      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(content)
      }

      // Return the final content
      return content
    } catch (error) {
      console.error("Streaming content error:", error)

      if (options.onError) {
        options.onError((error as Error).message || "An unknown error occurred")
      } else {
        toast({
          title: "Error",
          description: (error as Error).message || "An unknown error occurred",
          variant: "destructive",
        })
      }

      return null
    } finally {
      // Reset streaming state
      resetState()
    }
  }

  return {
    isStreaming,
    readableStream,
    startStreaming,
    cancelStreaming,
  }
}
