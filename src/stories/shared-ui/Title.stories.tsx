import Title from "@shared/ui/typography/Title";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Shared UI/Typography/Title",
  component: Title,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text",
      description: "タイトルテキスト",
    },
    color: {
      control: "color",
      description: "テキストと左ボーダーの色",
    },
    borderColor: {
      control: "color",
      description: "左ボーダーの色（color を上書き）",
    },
    variant: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "h5", "h6"],
      description: "タイポグラフィバリアント",
    },
  },
} satisfies Meta<typeof Title>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "ページタイトル",
    color: "#0FA85E",
  },
};

export const Large: Story = {
  args: {
    children: "大きなタイトル",
    variant: "h1",
    color: "#0FA85E",
  },
};

export const Medium: Story = {
  args: {
    children: "中程度のタイトル",
    variant: "h2",
    color: "#0FA85E",
  },
};

export const Small: Story = {
  args: {
    children: "小さいタイトル",
    variant: "h4",
    color: "#0FA85E",
  },
};

export const WithCustomColor: Story = {
  args: {
    children: "カスタムカラータイトル",
    color: "#1976d2",
  },
};

export const WithCustomBorderColor: Story = {
  args: {
    children: "カスタムボーダーカラー",
    color: "#0FA85E",
    borderColor: "#dc004e",
  },
};
