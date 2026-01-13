import { Stack } from "@mui/material";
import Link from "@shared/ui/link/Link";
import type { Meta, StoryObj } from "@storybook/react";
import { BrowserRouter } from "react-router-dom";

const meta = {
  title: "Shared UI/Navigation/Link",
  component: Link,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  argTypes: {
    label: {
      control: "text",
      description: "リンクの表示テキスト",
    },
    href: {
      control: "text",
      description: "リンク先URL",
    },
    color: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "error",
        "warning",
        "info",
        "success",
        "inherit",
      ],
      description: "リンクの色",
    },
    variant: {
      control: "select",
      options: [
        "button",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "body1",
        "body2",
        "caption",
      ],
      description: "タイポグラフィバリアント",
    },
    underline: {
      control: "select",
      options: ["hover", "always", "none"],
      description: "下線表示の設定",
    },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    label: "プライマリリンク",
    href: "#",
    color: "primary",
    underline: "hover",
  },
};

export const Secondary: Story = {
  args: {
    label: "セカンダリリンク",
    href: "#",
    color: "secondary",
    underline: "hover",
  },
};

export const Underlined: Story = {
  args: {
    label: "常に下線付きリンク",
    href: "#",
    color: "primary",
    underline: "always",
  },
};

export const NoUnderline: Story = {
  args: {
    label: "下線なしリンク",
    href: "#",
    color: "primary",
    underline: "none",
  },
};

export const BodyVariant: Story = {
  args: {
    label: "本文内のリンク",
    href: "#",
    variant: "body1",
    color: "primary",
    underline: "hover",
  },
};

export const MultipleLinks: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <Link label="リンク 1" href="#" color="primary" underline="hover" />
      <Link label="リンク 2" href="#" color="secondary" underline="hover" />
      <Link label="リンク 3" href="#" color="primary" underline="none" />
    </Stack>
  ),
};
