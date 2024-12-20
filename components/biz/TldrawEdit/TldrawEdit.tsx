"use client"

import { useState, FC, useRef } from "react"
import { ImageIcon } from "lucide-react"
import dynamic from "next/dynamic"
import { Editor, setUserPreferences } from "@tldraw/tldraw"
import "@tldraw/tldraw/tldraw.css"
import { getSvgAsImage } from "./lib/getSvgAsImage"
import { blobToBase64 } from "./lib/blobToBase64"
import { TldrawEditProps } from "./interface"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

const Tldraw = dynamic(() => import("@tldraw/tldraw").then(mod => mod.Tldraw), {
  ssr: false,
})

const TldrawEdit: FC<TldrawEditProps> = ({ onSubmit }) => {
  const [, refresh] = useState({})
  const editorRef = useRef<Editor>()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/20 hover:bg-white/30"
            onClick={() => setOpen(true)}
          >
            <ImageIcon className="h-4 w-4 text-white/60" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Draw UI</p>
        </TooltipContent>
      </Tooltip>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-full">
          <SheetHeader className="px-6 py-4">
            <div className="flex justify-between items-center w-full">
              <SheetTitle>Draw UI</SheetTitle>
              <ExportButton
                editor={editorRef.current!}
                onSubmit={dataUrl => {
                  onSubmit(dataUrl)
                  setOpen(false)
                }}
              />
            </div>
          </SheetHeader>
          <div className="w-full h-[calc(100vh-80px)]">
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
      onClick={async e => {
        setLoading(true)
        try {
          e.preventDefault()
          console.log("editor", editor)

          const svg = await editor.getSvg(
            Array.from(editor.currentPageShapeIds),
          )
          if (!svg) {
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
      className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90"
    >
      {loading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        "Confirm"
      )}
    </Button>
  )
}

export default TldrawEdit
