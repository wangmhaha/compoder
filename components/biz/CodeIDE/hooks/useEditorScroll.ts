import { useEffect, useState, RefObject } from "react"

type EditorRef = RefObject<any>

/**
 * A hook to handle editor auto-scrolling behavior
 * Only auto-scrolls to the bottom when the editor is already scrolled to the bottom
 */
export function useEditorScroll(editorRef: EditorRef, contentDependency?: any) {
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true)

  // Function to check if editor is scrolled to bottom
  const isEditorAtBottom = () => {
    if (!editorRef.current) return false

    const editor = editorRef.current
    const scrollTop = editor.getScrollTop()
    const scrollHeight = editor.getScrollHeight()
    const clientHeight = editor.getLayoutInfo().height

    // Consider "at bottom" if within a small threshold (e.g., 10px) of the bottom
    const threshold = 10
    return scrollHeight - scrollTop - clientHeight <= threshold
  }

  // Function to scroll to the bottom of the editor
  const scrollToBottom = () => {
    if (editorRef.current) {
      const lineCount = editorRef.current.getModel().getLineCount()
      editorRef.current.revealLine(lineCount)
    }
  }

  // Effect to scroll to bottom when file content is updated, but only if already at bottom
  useEffect(() => {
    if (editorRef.current && isScrolledToBottom) {
      scrollToBottom()
    }
  }, [contentDependency, isScrolledToBottom])

  // Add scroll event listener to track if editor is at bottom
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolledToBottom(isEditorAtBottom())
    }

    if (editorRef.current) {
      const disposable = editorRef.current.onDidScrollChange(handleScroll)

      return () => {
        // Properly dispose the event listener to prevent memory leaks
        disposable.dispose()
      }
    }

    return undefined
  }, [editorRef.current])

  const handleEditorDidMount = () => {
    setIsScrolledToBottom(true) // Initially assume we're at the bottom
  }

  return {
    isScrolledToBottom,
    scrollToBottom,
    handleEditorDidMount,
  }
}
