import { Box, Container, Typography } from "@mui/material";
import type { StoryObj } from "@storybook/react";

const meta = {
  title: "Features/Shift/RequestForm",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "シフト希望申請フォーム。複雑な状態管理を含むため、Storybookでは基本的なレイアウトのみを表示します。",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Placeholder: Story = {
  render: () => (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          シフト希望申請フォーム
        </Typography>
        <Box
          sx={{
            p: 3,
            border: "1px dashed #ccc",
            borderRadius: 1,
            backgroundColor: "#f5f5f5",
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="textSecondary">
            ShiftRequestForm は複雑な状態管理とフォームロジックを含むため、
            <br />
            スタンドアロンのStorybookでは完全な実装が困難です。
            <br />
            実際の動作確認は、アプリケーション内で行ってください。
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ mt: 2, display: "block" }}>
          関連コンポーネント:
          src/features/shift/request-form/ui/ShiftRequestForm.tsx
        </Typography>
      </Box>
    </Container>
  ),
};
