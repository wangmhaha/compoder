import { Badge } from "@/components/ui/badge"
import type { ThemeType } from "./interface"

interface ThemeBadgeProps {
  theme: ThemeType
}

export function ThemeBadge({ theme }: ThemeBadgeProps) {
  const variants = {
    light:
      "bg-orange-50 text-orange-600/80 dark:bg-orange-950 dark:text-orange-300/80 font-normal",
    dark: "bg-violet-50 text-violet-600/80 dark:bg-violet-950 dark:text-violet-300/80 font-normal",
  }

  return (
    <Badge variant="secondary" className={variants[theme]}>
      {theme}
    </Badge>
  )
}
