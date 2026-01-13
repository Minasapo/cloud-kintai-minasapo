import { Box, Container, Typography } from "@mui/material";
import type { StoryObj } from "@storybook/react";

const meta = {
  title: "Features/Shift/ManagementBoard",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "シフト管理ボード。カレンダービュー、ドラッグアンドドロップ、複雑な状態管理を含むため、Storybookでは基本的なレイアウトのみを表示します。",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Placeholder: Story = {
  render: () => (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          シフト管理ボード
        </Typography>
        <Box
          sx={{
            p: 3,
            border: "1px dashed #ccc",
            borderRadius: 1,
            backgroundColor: "#f5f5f5",
            textAlign: "center",
            minHeight: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box>
            <Typography variant="body2" color="textSecondary">
              ShiftManagementBoard はカレンダービュー、ドラッグアンドドロップ、
              <br />
              複雑な状態管理を含むため、スタンドアロンのStorybookでは
              <br />
              完全な実装が困難です。
              <br />
              実際の動作確認は、アプリケーション内で行ってください。
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" sx={{ mt: 2, display: "block" }}>
          関連コンポーネント:
          src/features/shift/management/ui/ShiftManagementBoard.tsx
        </Typography>
      </Box>
    </Container>
  ),
};
