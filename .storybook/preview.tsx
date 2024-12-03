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
