import { Box, Typography } from "@mui/material";
import Page from "@shared/ui/page/Page";
import type { Meta, StoryObj } from "@storybook/react";
import { BrowserRouter } from "react-router-dom";

const meta = {
  title: "Shared UI/Page/Page",
  component: Page,
  parameters: {
    layout: "fullscreen",
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
    title: {
      control: "text",
      description: "ページのタイトル",
    },
    maxWidth: {
      control: "select",
      options: ["xl", "lg", "md", "sm", false],
      description: "コンテナの最大幅",
    },
    showDefaultHeader: {
      control: "boolean",
      description: "デフォルトヘッダー（パンくずとタイトル）を表示するか",
    },
  },
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "ページタイトル",
    maxWidth: "xl",
    showDefaultHeader: true,
    children: (
      <Box
        sx={{
          p: 2,
          border: "1px solid #ddd",
          borderRadius: 1,
          backgroundColor: "#f9f9f9",
        }}
      >
        <Typography variant="body1">
          これはページコンテンツの例です。通常のコンテンツがここに表示されます。
        </Typography>
      </Box>
    ),
  },
};

export const WithoutHeader: Story = {
  args: {
    title: "ページタイトル",
    maxWidth: "xl",
    showDefaultHeader: false,
    children: (
      <Box
        sx={{
          p: 2,
          border: "1px solid #ddd",
          borderRadius: 1,
          backgroundColor: "#f9f9f9",
        }}
      >
        <Typography variant="body1">
          ヘッダー（パンくず、タイトル）なしのページ。カスタムレイアウトで使用可能です。
        </Typography>
      </Box>
    ),
  },
};

export const SmallMaxWidth: Story = {
  args: {
    title: "狭いコンテナ",
    maxWidth: "sm",
    showDefaultHeader: true,
    children: (
      <Box
        sx={{
          p: 2,
          border: "1px solid #ddd",
          borderRadius: 1,
          backgroundColor: "#f9f9f9",
        }}
      >
        <Typography variant="body1">
          最大幅が制限されたコンテナです。フォームやダイアログに適しています。
        </Typography>
      </Box>
    ),
  },
};

export const MediumMaxWidth: Story = {
  args: {
    title: "中程度の幅",
    maxWidth: "md",
    showDefaultHeader: true,
    children: (
      <Box
        sx={{
          p: 2,
          border: "1px solid #ddd",
          borderRadius: 1,
          backgroundColor: "#f9f9f9",
        }}
      >
        <Typography variant="body1">
          中程度の幅のコンテナです。複合コンテンツに適しています。
        </Typography>
      </Box>
    ),
  },
};

export const WithCustomBreadcrumbs: Story = {
  args: {
    title: "詳細ページ",
    maxWidth: "lg",
    showDefaultHeader: true,
    breadcrumbs: [
      { label: "TOP", href: "/" },
      { label: "親ページ", href: "/parent" },
    ],
    children: (
      <Box
        sx={{
          p: 2,
          border: "1px solid #ddd",
          borderRadius: 1,
          backgroundColor: "#f9f9f9",
        }}
      >
        <Typography variant="body1">
          パンくずナビゲーション付きのページです。複数階層の階層構造に対応します。
        </Typography>
      </Box>
    ),
  },
};

export const LongContent: Story = {
  args: {
    title: "長いコンテンツ",
    maxWidth: "lg",
    showDefaultHeader: true,
    children: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Box key={i} sx={{ p: 2, border: "1px solid #ddd", borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              セクション {i + 1}
            </Typography>
            <Typography variant="body2">
              このセクションは複数のコンテンツブロックを表示します。スクロール可能な長いページの例です。
            </Typography>
          </Box>
        ))}
      </Box>
    ),
  },
};
