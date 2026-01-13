import { Box, Container, Typography } from "@mui/material";
import type { StoryObj } from "@storybook/react";

const meta = {
  title: "Widgets/Feedback/SnackbarGroup",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Redux ベースのグローバル Snackbar スタック。Redux store に依存するため、Storybookでは情報のみ表示します。",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Info: Story = {
  render: () => (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h6" gutterBottom>
          SnackbarGroup Widget
        </Typography>
        <Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: 1, mb: 2 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            SnackbarGroup は Redux store から通知メッセージを取得し、
            <br />
            複数のスナックバーをスタック表示します。
          </Typography>
        </Box>

        <Typography variant="h6" gutterBottom>
          機能
        </Typography>
        <ul>
          <li>成功メッセージ表示</li>
          <li>エラーメッセージ表示</li>
          <li>警告メッセージ表示</li>
          <li>自動非表示タイマー</li>
          <li>手動クローズ機能</li>
        </ul>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Redux Actions
        </Typography>
        <ul>
          <li>
            <code>setSnackbarSuccess(message)</code> - 成功通知
          </li>
          <li>
            <code>setSnackbarError(message)</code> - エラー通知
          </li>
          <li>
            <code>setSnackbarWarn(message)</code> - 警告通知
          </li>
        </ul>

        <Typography variant="caption" sx={{ mt: 3, display: "block" }}>
          関連コンポーネント: src/widgets/feedback/snackbar/SnackbarGroup.tsx
        </Typography>
      </Box>
    </Container>
  ),
};
