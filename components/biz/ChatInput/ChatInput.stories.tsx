import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ImageIcon, Smile, Link2, Code2 } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
// import { themes } from "@storybook/theming"
import { Meta, StoryFn } from "@storybook/react"
import ChatInput from "./ChatInput"
import { CodingBox } from "../CodingBox"

// 在文件顶部添加示例图片URL，添加 &w=100&h=100 参数来获取缩略图
const EXAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=48&h=48&fit=crop",
]

export default {
  title: "biz/ChatInput",
  component: ChatInput,
  tags: ["autodocs"],
} as Meta<typeof ChatInput>

// Basic template
const Template: StoryFn<typeof ChatInput> = args => {
  const [value, setValue] = useState("")
  return (
    <ChatInput
      {...args}
      value={value}
      onChange={val => {
        console.log("val", val)
        setValue(val)
      }}
      onSubmit={() => console.log("submitted:", value)}
    />
  )
}

// Basic example
export const Basic = Template.bind({})
Basic.args = {
  actions: [],
}

// Loading state example
export const Loading = Template.bind({})
Loading.args = {
  loading: true,
  actions: [],
}

// Example with a single action button
export const WithSingleAction = Template.bind({})
WithSingleAction.args = {
  actions: [
    <TooltipProvider key="draw-image">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <ImageIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Draw An Image</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  ],
}

// Example with multiple action buttons
export const WithMultipleActions = Template.bind({})
WithMultipleActions.args = {
  actions: [
    <TooltipProvider key="draw-image">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <ImageIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Draw An Image</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>,
    <TooltipProvider key="emoji">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <Smile className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Insert Emoji</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>,
    <TooltipProvider key="link">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <Link2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Insert Link</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>,
    <TooltipProvider key="code">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <Code2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Insert Code Block</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  ],
}

// Example with loading state and action buttons
export const LoadingWithActions = Template.bind({})
LoadingWithActions.args = {
  loading: true,
  actions: WithMultipleActions.args.actions,
}

// Example with prefilled content
export const WithPrefilledContent = Template.bind({})
WithPrefilledContent.args = {
  value: "This is some prefilled content in the chat input.",
  actions: WithMultipleActions.args.actions,
}

// 添加带图片的示例
export const WithImages = Template.bind({})
WithImages.args = {
  images: EXAMPLE_IMAGES,
  onImageRemove: (index: number) => {
    console.log("Removing image at index:", index)
  },
  actions: WithMultipleActions.args.actions,
}

// 添加带图片且处于加载状态的示例
export const LoadingWithImages = Template.bind({})
LoadingWithImages.args = {
  loading: true,
  images: EXAMPLE_IMAGES,
  onImageRemove: (index: number) => {
    console.log("Removing image at index:", index)
  },
  actions: WithMultipleActions.args.actions,
}

// 添加一个完整功能的示例
export const FullFeatured = Template.bind({})
FullFeatured.args = {
  images: EXAMPLE_IMAGES.slice(0, 1), // 只显示一张图片
  onImageRemove: (index: number) => {
    console.log("Removing image at index:", index)
  },
  actions: WithMultipleActions.args.actions,
  value: "Check out this amazing image! 🖼️",
}

// 可选：添加一个多图片的示例
export const WithMultipleImages = Template.bind({})
WithMultipleImages.args = {
  images: [
    ...EXAMPLE_IMAGES,
    ...EXAMPLE_IMAGES, // 重复图片以展示多图片布局
  ],
  onImageRemove: (index: number) => {
    console.log("Removing image at index:", index)
  },
  actions: WithMultipleActions.args.actions,
}

// 首先添加 StreamingExample 组件
const StreamingExample = () => {
  const [streamingCode, setStreamingCode] = useState(`$ please enter your prompt

> generate a component for a login page

🚀 compoder running...
`)
  const fullCode = `
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
export default function Component() {
  return (
    <div>
      <Button>Click me</Button>
      <Input placeholder="Type something..." />
      <Textarea placeholder="Write your thoughts here..." />
      <Select>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
      </Select>
      <Checkbox />
      <RadioGroup>
        <RadioGroupItem value="option1">Option 1</RadioGroupItem>
        <RadioGroupItem value="option2">Option 2</RadioGroupItem>
      </RadioGroup>
    </div>
  )
}
`

  useEffect(() => {
    const lines = new Array(100).fill(fullCode).join("\n").split("\n")
    let currentLine = 0

    const interval = setInterval(() => {
      if (currentLine < lines.length) {
        setStreamingCode(prev => prev + (prev ? "\n" : "") + lines[currentLine])
        currentLine++
      } else {
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <CodingBox
      code={streamingCode}
      showMacControls={true}
      className="h-[300px]"
    />
  )
}

// 添加带有 loadingSlot 的示例
export const WithLoadingSlot = Template.bind({})
WithLoadingSlot.args = {
  loading: true,
  loadingSlot: <StreamingExample />,
  actions: WithMultipleActions.args.actions,
}

// 添加完整功能且带有 loadingSlot 的示例
export const FullFeaturedWithLoadingSlot = Template.bind({})
FullFeaturedWithLoadingSlot.args = {
  loading: true,
  loadingSlot: <StreamingExample />,
  images: EXAMPLE_IMAGES,
  onImageRemove: (index: number) => {
    console.log("Removing image at index:", index)
  },
  actions: WithMultipleActions.args.actions,
  value: "Processing your request...",
}
