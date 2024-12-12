import React, { useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { CodingBoxProps } from "./interface"
import { useScrollToBottom } from "@/hooks/use-scroll"

const CodingBox: React.FC<CodingBoxProps> = ({
  code = "",
  className,
  showMacControls = true,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  useScrollToBottom(scrollRef, [code])

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden shadow-lg",
        "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800",
        className,
      )}
    >
      {showMacControls && (
        <div className="h-7 flex items-center px-4 bg-zinc-100 dark:bg-zinc-800">
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
        <pre className="whitespace-pre-wrap text-zinc-900 dark:text-zinc-100">
          {code}
        </pre>
      </ScrollArea>
    </div>
  )
}

export default CodingBox
