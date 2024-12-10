import React, { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ComponentCodeVersionsContainerProps } from "./interface"
import { MessageCircleMore } from "lucide-react"

const ComponentCodeVersionsContainer = ({
  versions,
  activeVersion,
  onVersionChange,
  children,
  bubbleContent,
}: ComponentCodeVersionsContainerProps) => {
  const [hoveredVersion, setHoveredVersion] = useState<number | null>(null)
  const dotsContainerRef = useRef<HTMLDivElement>(null)

  // Calculate and adjust the position of the dots container
  useEffect(() => {
    const container = dotsContainerRef.current
    if (!container) return

    const activeIndex = versions.indexOf(activeVersion)
    if (activeIndex === -1) return

    const dotHeight = 8 // Height of each dot
    const gap = 16 // gap-4 in pixels
    const centerPosition = container.clientHeight / 2
    const dotPosition =
      (versions.length - 1 - activeIndex) * (dotHeight + gap) + dotHeight / 2

    // Calculate offset needed to center the active dot
    const offset = centerPosition - dotPosition

    // Apply offset with smooth transition
    container.style.transform = `translateY(${offset}px)`
  }, [activeVersion, versions])

  return (
    <div className="flex min-h-[200px]">
      {/* Version indicator section */}
      <div className="relative flex items-center pr-4">
        <div
          ref={dotsContainerRef}
          className="flex flex-col gap-4 transition-transform duration-300 ease-in-out"
        >
          <TooltipProvider>
            {[...versions].reverse().map((version, index) => (
              <Tooltip key={version}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full cursor-pointer transition-all duration-300",
                      "bg-gray-300 dark:bg-gray-600",
                      "hover:scale-150 hover:bg-gray-400 dark:hover:bg-gray-500",
                      activeVersion === version &&
                        "scale-150 bg-gray-500 dark:bg-gray-300",
                      hoveredVersion === versions.length - 1 - index &&
                        "scale-150 bg-gray-400 dark:bg-gray-500",
                    )}
                    onClick={() => onVersionChange(version)}
                    onMouseEnter={() =>
                      setHoveredVersion(versions.length - 1 - index)
                    }
                    onMouseLeave={() => setHoveredVersion(null)}
                  />
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12}>
                  <p>v{version}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
        {/* Arrow */}
        <div className="absolute right-[-1px] top-1/2 -translate-y-1/2">
          <svg
            width="8"
            height="16"
            viewBox="0 0 8 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative bg-white dark:bg-gray-900"
          >
            <path
              d="M8 0L0 8L8 16"
              stroke="currentColor"
              className="text-gray-200 dark:text-gray-700"
              strokeWidth="1"
              fill="none"
            />
          </svg>
        </div>
      </div>

      {/* Content container section */}
      <div className="flex-1 border rounded-lg p-4 border-gray-200 dark:border-gray-800 bg-white dark:bg-background">
        <p className="flex items-center gap-2 w-fit rounded-tr-lg rounded-tl-lg rounded-br-lg bg-violet-50 dark:bg-violet-900/30 p-2 dark:text-violet-100 mb-2">
          <MessageCircleMore className="w-4 h-4" />
          {bubbleContent}
        </p>
        {children}
      </div>
    </div>
  )
}

export default ComponentCodeVersionsContainer
