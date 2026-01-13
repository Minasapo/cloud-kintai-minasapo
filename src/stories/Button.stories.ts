import Button from "@mui/material/Button";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "UI Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["text", "outlined", "contained"],
    },
    color: {
      control: "select",
      options: [
        "inherit",
        "primary",
        "secondary",
        "error",
        "warning",
        "info",
        "success",
      ],
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "contained",
    color: "primary",
    children: "Primary Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "contained",
    color: "secondary",
    children: "Secondary Button",
  },
};

export const Outlined: Story = {
  args: {
    variant: "outlined",
    color: "primary",
    children: "Outlined Button",
  },
};

export const Text: Story = {
  args: {
    variant: "text",
    color: "primary",
    children: "Text Button",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    variant: "contained",
    children: "Disabled Button",
  },
};

export const Large: Story = {
  args: {
    variant: "contained",
    size: "large",
    children: "Large Button",
  },
};

export const Small: Story = {
  args: {
    variant: "contained",
    size: "small",
    children: "Small Button",
  },
};
