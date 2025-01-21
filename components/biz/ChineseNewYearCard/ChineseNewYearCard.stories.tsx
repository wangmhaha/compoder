import type { Meta, StoryObj } from "@storybook/react";
import { ChineseNewYearCard } from "./index";

const meta = {
  title: "Business/ChineseNewYearCard",
  component: ChineseNewYearCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A festive Chinese New Year 2025 greeting card component with animations and interactive red packet feature.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ChineseNewYearCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const InContainer: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div style={{ width: "600px", padding: "20px" }}>
        <Story />
      </div>
    ),
  ],
}; 