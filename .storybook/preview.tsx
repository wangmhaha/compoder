import React from "react"
import type { Preview } from "@storybook/react"
import { ThemeProvider } from "next-themes"
import "../app/globals.css"

import { withThemeByClassName } from "@storybook/addon-themes"

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      viewports: {
        mobile1: {
          name: "Mobile (360px)",
          styles: {
            width: "360px",
            height: "640px",
          },
        },
        tablet: {
          name: "Tablet (768px)",
          styles: {
            width: "768px",
            height: "1024px",
          },
        },
        desktop: {
          name: "Desktop (1280px)",
          styles: {
            width: "1280px",
            height: "800px",
          },
        },
      },
    },
  },
}

export const decorators = [
  Story => (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Story />
    </ThemeProvider>
  ),
  withThemeByClassName({
    themes: {
      // nameOfTheme: 'classNameForTheme',
      light: "",
      dark: "dark",
    },
    defaultTheme: "light",
  }),
]

export default preview
