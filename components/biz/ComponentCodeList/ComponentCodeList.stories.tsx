import type { Meta, StoryObj } from "@storybook/react"
import { ComponentCodeList } from "./ComponentCodeList"
import { ComponentItem } from "./interface"

const meta = {
  title: "Biz/ComponentCodeList",
  component: ComponentCodeList,
} satisfies Meta<typeof ComponentCodeList>

export default meta
type Story = StoryObj<typeof ComponentCodeList>

const mockItems = [
  {
    id: "1",
    title: "CSS Theme Switch",
    description: "A beautiful theme switch component with smooth transitions",
  },
  {
    id: "2",
    title: "Dark Mode Toggle",
    description: "Simple and elegant dark mode toggle with system preference",
  },
  {
    id: "3",
    title: "Color Scheme Picker",
    description: "Advanced color scheme picker with custom theme support",
  },
  {
    id: "4",
    title: "Customizable Button",
    description: "A customizable button with various styles and sizes",
  },
  {
    id: "5",
    title: "Responsive Layout",
    description: "A responsive layout with breakpoints and media queries",
  },
  {
    id: "6",
    title: "Animated Loader",
    description: "A loader with smooth animations and customizable colors",
  },
] as ComponentItem[]

export const Default: Story = {
  args: {
    items: mockItems,
    onEditClick: id => console.log("Edit clicked:", id),
    onDeleteClick: id => console.log("Delete clicked:", id),
  },
}

export const SingleItem: Story = {
  args: {
    items: [mockItems[0]],
    onEditClick: id => console.log("Edit clicked:", id),
    onDeleteClick: id => console.log("Delete clicked:", id),
  },
}

export const TwoItems: Story = {
  args: {
    items: mockItems.slice(0, 2),
    onEditClick: id => console.log("Edit clicked:", id),
    onDeleteClick: id => console.log("Delete clicked:", id),
  },
}
