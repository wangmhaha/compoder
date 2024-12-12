import React, { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { CodingBoxProps } from "./interface"

const CodingBox: React.FC<CodingBoxProps> = ({
  code = "",
  className,
  autoScroll = true,
  showMacControls = true,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [code, autoScroll])

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden bg-[#1E1E1E] shadow-lg",
        className,
      )}
    >
      {showMacControls && (
        <div className="h-7 bg-[#2D2D2D] flex items-center px-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>
        </div>
      )}
      <ScrollArea
        ref={scrollRef}
        className="h-[calc(100%-28px)] p-4 font-mono text-sm"
      >
        <pre className="text-white whitespace-pre-wrap">{code}</pre>
      </ScrollArea>
    </div>
  )
}

export default CodingBox
