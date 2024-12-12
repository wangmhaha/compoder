import React, { useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
      }
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    const drops: number[] = []
    const fontSize = 14

    const initDrops = () => {
      const columns = canvas.width / fontSize
      for (let i = 0; i < columns; i++) {
        drops[i] = 1
      }
    }
    initDrops()

    const draw = () => {
      ctx.fillStyle =
        theme === "dark" ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = theme === "dark" ? "#0F0" : "rgba(0, 180, 0, 0.7)"
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    const interval = setInterval(draw, 33)

    return () => {
      clearInterval(interval)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "absolute top-0 left-0 w-full h-full pointer-events-none",
        "dark:opacity-15 opacity-10",
      )}
    />
  )
}

export default MatrixRain
