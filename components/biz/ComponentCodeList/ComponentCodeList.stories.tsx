import type { Meta, StoryObj } from "@storybook/react"
import { ComponentCodeList } from "./ComponentCodeList"
import { ComponentItem } from "./interface"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

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
    description: "A beautiful",
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

export const AnimatedAddition: Story = {
  render: function AnimatedAdditionStory() {
    const [items, setItems] = useState<ComponentItem[]>(mockItems)

    useEffect(() => {
      // Add a new item after 1.5 seconds
      const timer = setTimeout(() => {
        setItems(prevItems => [
          {
            id: "new-1",
            title: "New Component",
            description: "This component just flew in!",
          },
          ...prevItems,
        ])
      }, 1500)

      return () => clearTimeout(timer)
    }, [])

    return (
      <ComponentCodeList
        items={items}
        onEditClick={id => console.log("Edit clicked:", id)}
        onDeleteClick={id => console.log("Delete clicked:", id)}
      />
    )
  },
}

export const ClickToAddCard: Story = {
  render: function ClickToAddCardStory() {
    const [items, setItems] = useState<ComponentItem[]>(mockItems)

    const handleAddCard = () => {
      const newCard = {
        id: `new-${Date.now()}`,
        title: "New Component",
        description: "This component just flew in from where you clicked!",
      }

      setItems(prevItems => [newCard, ...prevItems])
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-[1000px]">
          <h3 className="text-lg font-medium">
            Click anywhere to add a new card
          </h3>
          <Button onClick={handleAddCard}>Add Card</Button>
        </div>
        <ComponentCodeList
          items={items}
          onEditClick={id => console.log("Edit clicked:", id)}
          onDeleteClick={id => console.log("Delete clicked:", id)}
        />
      </div>
    )
  },
}
