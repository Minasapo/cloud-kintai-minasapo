import type { Meta, StoryObj } from "@storybook/react";
import { Box, Container, Typography } from "@mui/material";

const meta = {
  title: "Widgets/Layout/Footer",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "アプリケーション共通フッター。テーマ設定に依存するため、Storybookでは基本的なレイアウトのみを表示します。",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

// Footer コンポーネントは AppConfigContext に依存するため、
// Storybook では簡略版を表示
export const Info: Story = {
  render: () => (
    <Box>
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Typography variant="h6" gutterBottom>
            Footer Widget
          </Typography>
          <Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary">
              Footer は AppConfigContext に依存して、テーマカラーを動的に適用します。
            </Typography>
          </Box>
        </Box>
      </Container>

      {/* フッターのプレビュー */}
      <Box
        sx={{
          marginTop: "auto",
          backgroundColor: "#0FA85E",
          color: "white",
          p: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="body2">© 2026 Application Footer</Typography>
      </Box>

      <Typography variant="caption" sx={{ mt: 2, display: "block", p: 2 }}>
        関連コンポーネント: src/widgets/layout/footer/Footer.tsx
      </Typography>
    </Box>
  ),
};
