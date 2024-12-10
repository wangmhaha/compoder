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

export const Default: Story = {
  args: {
    data: sampleData,
  },
}
