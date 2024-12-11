import type { Meta, StoryObj } from "@storybook/react"
import { CodeIDE } from "./CodeIDE"
import { FileNode } from "./interface"

const meta = {
  title: "Biz/CodeIDE",
  component: CodeIDE,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof CodeIDE>

export default meta
type Story = StoryObj<typeof meta>

const sampleData: FileNode[] = [
  {
    id: "1",
    name: "app",
    children: [
      {
        id: "2",
        name: "api",
        children: [
          {
            id: "3",
            name: "hello",
            children: [
              {
                id: "4",
                name: "route.ts",
                content: `export async function GET(request: Request) {
  return new Response('Hello, Next.js!')
}`,
                language: "typescript",
              },
            ],
          },
        ],
      },
      {
        id: "5",
        name: "page.tsx",
        content: `export default function Home() {
  return <h1>Hello World</h1>
}`,
        language: "typescript",
      },
      {
        id: "6",
        name: "layout.tsx",
        content: `export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}`,
        language: "typescript",
      },
    ],
  },
  {
    id: "7",
    name: "components",
    children: [
      {
        id: "8",
        name: "ui",
        children: [
          {
            id: "9",
            name: "button.tsx",
            content: `export function Button() {
  return <button>Click me</button>
}`,
            language: "typescript",
          },
        ],
      },
    ],
  },
]

export const WithSaveHandler: Story = {
  args: {
    data: sampleData,
    onSave: async (files: FileNode[]) => {
      // 模拟异步保存操作
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log("Files saved:", files)
      // 这里你可以在控制台中查看保存的文件内容
    },
  },
}

export const WithSaveError: Story = {
  args: {
    data: sampleData,
    onSave: async () => {
      // 模拟保存失败的情况
      await new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Failed to save")), 1000),
      )
    },
  },
}

// 添加参数说明
WithSaveHandler.parameters = {
  docs: {
    description: {
      story:
        "Demonstrates successful file saving with a delay to simulate API call.",
    },
  },
}

WithSaveError.parameters = {
  docs: {
    description: {
      story: "Demonstrates error handling when save operation fails.",
    },
  },
}
