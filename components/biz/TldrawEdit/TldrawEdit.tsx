"use client"

import { useState, FC, useRef } from "react"
import { ImageIcon, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import { Editor, setUserPreferences } from "@tldraw/tldraw"
import { getSvgAsImage } from "./lib/getSvgAsImage"
import { blobToBase64 } from "./lib/blobToBase64"
import { TldrawEditProps } from "./interface"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import "@tldraw/tldraw/tldraw.css"
import { toast } from "@/hooks/use-toast"

const Tldraw = dynamic(() => import("@tldraw/tldraw").then(mod => mod.Tldraw), {
  ssr: false,
})

const TldrawEdit: FC<TldrawEditProps> = ({ onSubmit }) => {
  const [, refresh] = useState({})
  const editorRef = useRef<Editor>()
  const [open, setOpen] = useState(false)

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/20 hover:bg-background/30 dark:bg-white/20 dark:hover:bg-white/30"
              onClick={() => setOpen(true)}
            >
              <ImageIcon className="h-4 w-4 text-foreground/70 dark:text-white/70" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Draw UI</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-full">
          <SheetHeader className="px-6 py-4">
            <div className="flex justify-between items-center w-full">
              <SheetTitle>Draw UI</SheetTitle>
            </div>
          </SheetHeader>
          <div className="w-full h-[calc(100vh-60px)] [&_.tlui-debug-panel]:hidden relative">
            <Tldraw
              onMount={editor => {
                editorRef.current = editor
                setUserPreferences({
                  isDarkMode: true,
                  id: "tldraw",
                })
                refresh({})
              }}
              persistenceKey="tldraw"
            />
            <div className="fixed top-[60px] left-[50%] translate-x-[-50%] z-[1000] bg-background/95 border rounded-lg shadow-lg px-3 py-2 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 min-w-[200px]">
              <p className="text-sm text-foreground whitespace-nowrap">
                Submit the drawn UI?
              </p>
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => {
                    if (editorRef.current) {
                      const shapes = Array.from(
                        editorRef.current.currentPageShapeIds,
                      )
                      editorRef.current.deleteShapes(shapes)
                    }
                  }}
                >
                  Clear
                </Button>
                <ExportButton
                  editor={editorRef.current!}
                  onSubmit={dataUrl => {
                    onSubmit(dataUrl)
                    setOpen(false)
                  }}
                />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

function ExportButton({
  onSubmit,
  editor,
}: {
  onSubmit: (dataUrl: string) => void
  editor: Editor
}) {
  const [loading, setLoading] = useState(false)
  return (
    <Button
      variant="default"
      size="sm"
      className="h-8 px-3"
      onClick={async e => {
        setLoading(true)
        try {
          e.preventDefault()
          const svg = await editor.getSvg(
            Array.from(editor.currentPageShapeIds),
          )
          if (!svg) {
            toast({
              title: "Failed to export SVG",
              variant: "destructive",
            })
            return
          }
          const png = await getSvgAsImage(svg, {
            type: "png",
            quality: 1,
            scale: 1,
          })
          const dataUrl = (await blobToBase64(png!)) as string
          onSubmit(dataUrl)
        } finally {
          setLoading(false)
        }
      }}
      disabled={loading}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
      Submit
    </Button>
  )
}

export default TldrawEdit
