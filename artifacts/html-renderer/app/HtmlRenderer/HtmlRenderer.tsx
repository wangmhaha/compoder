import React, { useEffect, useRef } from "react"
import { ErrorBoundary } from "./ErrorBoundary"
import type { HtmlRendererProps } from "./interface"

const HtmlRenderer: React.FC<HtmlRendererProps> = ({
  html,
  onError,
  onSuccess,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    try {
      // 添加错误处理脚本到HTML内容
      const htmlWithErrorHandling = html.replace(
        "</body>",
        `
        <script>
          // Error handling for script execution
          window.onerror = function(message, source, lineno, colno, error) {
            // 直接发送到html-renderer，由html-renderer转发到最外层父窗口
            window.parent.postMessage({
              type: 'iframe-error',
              errorMessage: 'JavaScript error: ' + message + ' (line: ' + lineno + ', column: ' + colno + ')'
            }, '*');
            return true;
          };
        </script>
      </body>
      `,
      )

      // 获取iframe元素
      const iframe = iframeRef.current
      if (!iframe) return

      // 设置srcdoc属性
      iframe.srcdoc = htmlWithErrorHandling

      // 监听内部iframe的消息事件
      const handleIframeMessage = (event: MessageEvent) => {
        // 检查消息是否来自内部iframe
        if (iframe.contentWindow === event.source) {
          const { type, errorMessage } = event.data || {}

          // 如果是错误消息，则转发到外部父窗口
          if (type === "iframe-error" && errorMessage) {
            onError(errorMessage)
          }
        }
      }

      // 添加消息事件监听器
      window.addEventListener("message", handleIframeMessage)

      // 监听iframe加载完成事件
      const handleLoad = () => {
        onSuccess()
      }

      iframe.addEventListener("load", handleLoad)

      // 清理事件监听
      return () => {
        iframe.removeEventListener("load", handleLoad)
        window.removeEventListener("message", handleIframeMessage)
      }
    } catch (error: any) {
      console.error("HTML rendering error:", error)
      onError("HTML rendering error: " + error.message)
    }
  }, [html, onError, onSuccess])

  return (
    <ErrorBoundary onError={onError} html={html}>
      <iframe
        ref={iframeRef}
        style={{
          width: "100%",
          height: "100vh",
          border: "none",
          backgroundColor: "white",
        }}
        title="HTML Content"
        sandbox="allow-scripts allow-same-origin"
      />
    </ErrorBoundary>
  )
}

export default HtmlRenderer
