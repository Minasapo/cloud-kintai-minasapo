import CommonBreadcrumbs from "@shared/ui/breadcrumbs/CommonBreadcrumbs";
import type { Meta, StoryObj } from "@storybook/react";
import { BrowserRouter } from "react-router-dom";

const meta = {
  title: "Shared UI/Navigation/CommonBreadcrumbs",
  component: CommonBreadcrumbs,
  parameters: {
    layout: "padded",
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
    items: {
      description: "パンくずナビゲーション項目の配列",
    },
    current: {
      control: "text",
      description: "現在のページタイトル",
    },
  },
} satisfies Meta<typeof CommonBreadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [{ label: "TOP", href: "/" }],
    current: "ページA",
  },
};

export const TwoLevels: Story = {
  args: {
    items: [
      { label: "TOP", href: "/" },
      { label: "親ページ", href: "/parent" },
    ],
    current: "子ページ",
  },
};

export const ThreeLevels: Story = {
  args: {
    items: [
      { label: "TOP", href: "/" },
      { label: "カテゴリ", href: "/category" },
      { label: "サブカテゴリ", href: "/category/sub" },
    ],
    current: "詳細ページ",
  },
};

export const DeepNesting: Story = {
  args: {
    items: [
      { label: "TOP", href: "/" },
      { label: "管理画面", href: "/admin" },
      { label: "スタッフ管理", href: "/admin/staff" },
      { label: "詳細", href: "/admin/staff/detail" },
    ],
    current: "編集",
  },
};

export const WithoutHref: Story = {
  args: {
    items: [{ label: "TOP" }],
    current: "ページ",
  },
};
