import { Box, Typography } from "@mui/material";
import PageSection from "@shared/ui/layout/PageSection";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Shared UI/Layout/PageSection",
  component: PageSection,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["surface", "plain"],
      description: "セクションのスタイルバリアント",
    },
    layoutVariant: {
      control: "select",
      options: ["dashboard", "detail"],
      description: "レイアウトバリアント（パディング、背景、影が異なる）",
    },
  },
} satisfies Meta<typeof PageSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DashboardSurface: Story = {
  args: {
    variant: "surface",
    layoutVariant: "dashboard",
    children: (
      <Box>
        <Typography variant="h4" gutterBottom>
          ダッシュボードセクション
        </Typography>
        <Typography variant="body2">
          これはダッシュボードスタイルのページセクションです。白背景で大きめのパディングが適用されます。
        </Typography>
      </Box>
    ),
  },
};

export const DetailLayout: Story = {
  args: {
    variant: "surface",
    layoutVariant: "detail",
    children: (
      <Box>
        <Typography variant="h4" gutterBottom>
          詳細ページセクション
        </Typography>
        <Typography variant="body2">
          これは詳細ページスタイルのセクションです。より小さいパディングと薄い背景が特徴です。
        </Typography>
      </Box>
    ),
  },
};

export const PlainVariant: Story = {
  args: {
    variant: "plain",
    layoutVariant: "dashboard",
    children: (
      <Box>
        <Typography variant="h4" gutterBottom>
          プレーンセクション
        </Typography>
        <Typography variant="body2">背景なしのシンプルなセクション</Typography>
      </Box>
    ),
  },
};

export const MultipleSection: Story = {
  render: () => (
    <Box sx={{ p: 2, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <PageSection layoutVariant="dashboard">
        <Typography variant="h4" gutterBottom>
          セクション 1
        </Typography>
        <Typography variant="body2">最初のセクションのコンテンツ</Typography>
      </PageSection>
      <Box sx={{ height: "16px" }} />
      <PageSection layoutVariant="dashboard">
        <Typography variant="h4" gutterBottom>
          セクション 2
        </Typography>
        <Typography variant="body2">2番目のセクションのコンテンツ</Typography>
      </PageSection>
    </Box>
  ),
};
