import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Copy } from "lucide-react"
import type { ComponentCodeListProps } from "./interface"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { CodeRenderer } from "../CodeRenderer"

export function ComponentCodeList({
  items,
  onItemClick,
  onEditClick,
  onDeleteClick,
  className,
  newItem,
  codeRendererServer,
}: ComponentCodeListProps) {
  const [clickPosition, setClickPosition] = useState<{
    x: number
    y: number
  } | null>(null)

  // Create a ref for the container
  const containerRef = useRef<HTMLDivElement>(null)

  // Listen for click events to record click position
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Use the ref to get container element position
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        // Calculate position relative to container
        setClickPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      }
    }

    window.addEventListener("click", handleClick)
    return () => window.removeEventListener("click", handleClick)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
        className || ""
      }`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {newItem && (
          <motion.div
            layout
            initial={
              clickPosition
                ? {
                    opacity: 1,
                    scale: 0.5,
                    x: clickPosition.x,
                    y: clickPosition.y,
                  }
                : {
                    opacity: 0,
                    scale: 0.8,
                  }
            }
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
              y: 0,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 50,
              damping: 20,
              mass: 1.2,
              duration: 15,
            }}
          >
            <div className="h-full w-full aspect-[1.5] overflow-hidden">
              {newItem}
            </div>
          </motion.div>
        )}
        {items?.map(item => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
              y: 0,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 50,
              damping: 20,
              mass: 1.2,
              duration: 15,
            }}
          >
            <Card
              className="group h-full relative overflow-hidden bg-card transition-all cursor-pointer
                hover:shadow-[0_0_20px_-3px_rgba(167,139,250,0.3)]
                after:absolute after:w-[1px] after:h-full after:right-0 after:top-0 after:bg-gradient-to-b after:from-transparent dark:after:via-violet-500/50 after:via-violet-300/30 after:to-transparent
                before:absolute before:w-full before:h-[1px] before:left-0 before:bottom-0 before:bg-gradient-to-r before:from-transparent dark:before:via-violet-500/50 before:via-violet-300/30 before:to-transparent"
              onClick={() => onItemClick?.(item.id)}
            >
              {/* Action buttons */}
              <div className="absolute right-2 top-2 flex opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:gap-1">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90 relative transition-all duration-200
                    [&:not(:first-child)]:-ml-6 group-hover:ml-0"
                  onClick={e => {
                    e.stopPropagation()
                    onEditClick?.(item.id)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90 relative transition-all duration-200
                    [&:not(:first-child)]:-ml-6 group-hover:ml-0"
                  onClick={e => {
                    e.stopPropagation()
                    onDeleteClick?.(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90 relative transition-all duration-200
                    [&:not(:first-child)]:-ml-6 group-hover:ml-0"
                  onClick={e => e.stopPropagation()}
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy</span>
                </Button>
              </div>

              {/* Preview area with hover effect */}
              <div className="aspect-video bg-muted/30 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <CodeRenderer
                    codeRendererServer={codeRendererServer || ""}
                    codes={item.code}
                    onFixError={() => {}}
                  />
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold truncate">{item.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
