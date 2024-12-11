import React from "react"
import { useTheme } from "next-themes"

export const ThemeObserver = () => {
  const { setTheme } = useTheme()

  React.useEffect(() => {
    // 创建 MutationObserver 实例
    const observer = new MutationObserver(mutations => {
      console.log("mutations", mutations)
      mutations.forEach(mutation => {
        if (mutation.attributeName === "class") {
          const htmlElement = document.documentElement
          const theme = htmlElement.classList.contains("dark")
            ? "dark"
            : "light"
          console.log("mutations theme", theme)
          localStorage.setItem("theme", theme)
          setTheme(theme)
        }
      })
    })

    // 开始观察 html 元素的 class 变化
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    // 清理函数
    return () => observer.disconnect()
  }, [])

  return null
}
