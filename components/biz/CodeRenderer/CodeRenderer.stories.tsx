import type { Meta, StoryObj } from "@storybook/react"
import { CodeRenderer } from "./CodeRenderer"

const meta = {
  title: "Biz/CodeRenderer",
  component: CodeRenderer,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CodeRenderer>

export default meta
type Story = StoryObj<typeof meta>

const mockCode = `
import React from 'react';

export default function Button() {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded">
      Click me
    </button>
  );
}
`

const mockFiles = [
  {
    filePath: "Button.tsx",
    content: mockCode,
  },
]

export const SingleFile: Story = {
  args: {
    codeRendererServer: "http://localhost:3001",
    onFixError: error => console.log("Error:", error),
    codes: mockCode,
  },
}

export const MultipleFiles: Story = {
  args: {
    codeRendererServer: "http://localhost:3001",
    onFixError: error => console.log("Error:", error),
    codes: mockFiles,
  },
}
