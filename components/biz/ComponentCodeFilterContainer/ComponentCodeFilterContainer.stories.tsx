import type { Meta, StoryObj } from "@storybook/react"
import { ComponentCodeFilterContainer } from "./index"
import { ComponentCodeList } from "../ComponentCodeList/ComponentCodeList"
import type { ComponentItem } from "../ComponentCodeList/interface"

const meta: Meta<typeof ComponentCodeFilterContainer> = {
  title: "Biz/ComponentCodeFilterContainer",
  component: ComponentCodeFilterContainer,
}

export default meta
type Story = StoryObj<typeof ComponentCodeFilterContainer>

const mockItems: ComponentItem[] = [
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
  {
    id: "7",
    title: "Customizable Button",
    description: "A customizable button with various styles and sizes",
  },
  {
    id: "8",
    title: "Customizable Button",
    description: "A customizable button with various styles and sizes",
  },
]

export const Default: Story = {
  args: {
    pageSize: 5,
    total: mockItems.length,
    currentPage: 1,
    searchKeyword: "",
    filterField: "all",
    children: (
      <ComponentCodeList
        items={mockItems}
        onEditClick={id => console.log("Edit clicked:", id)}
        onDeleteClick={id => console.log("Delete clicked:", id)}
      />
    ),
    onPageChange: page => {
      console.log("页码改变:", page)
    },
    onSearchChange: keyword => {
      console.log("搜索关键词改变:", keyword)
    },
    onFilterFieldChange: field => {
      console.log("过滤字段改变:", field)
    },
  },
}

export const SinglePage: Story = {
  args: {
    pageSize: 10,
    total: 1,
    currentPage: 1,
    searchKeyword: "theme",
    filterField: "all",
    children: (
      <ComponentCodeList
        items={[mockItems[0]]}
        onEditClick={id => console.log("Edit clicked:", id)}
        onDeleteClick={id => console.log("Delete clicked:", id)}
      />
    ),
    onPageChange: page => {
      console.log("页码改变:", page)
    },
    onSearchChange: keyword => {
      console.log("搜索关键词改变:", keyword)
    },
    onFilterFieldChange: field => {
      console.log("过滤字段改变:", field)
    },
  },
}
