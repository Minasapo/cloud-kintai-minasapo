import SaveIcon from "@mui/icons-material/Save";
import Button from "@mui/material/Button";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "UI Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    variant: "contained",
    color: "primary",
    size: "medium",
    children: "Save",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["text", "outlined", "contained"],
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "error", "warning", "success"],
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "Save",
  },
};

export const Secondary: Story = {
  args: {
    color: "secondary",
    children: "Back",
  },
};

export const Destructive: Story = {
  args: {
    color: "error",
    children: "Delete",
  },
};

export const Outlined: Story = {
  args: {
    variant: "outlined",
    children: "Save draft",
  },
};

export const Text: Story = {
  args: {
    variant: "text",
    children: "Cancel",
  },
};

export const WithIcon: Story = {
  args: {
    startIcon: <SaveIcon fontSize="small" />,
    children: "Save and continue",
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: "Submit",
  },
};
