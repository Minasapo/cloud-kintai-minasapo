import { Alert, AlertTitle, Box } from "@mui/material";

export default function ErrorStatusAlert() {
  return (
    <Box sx={{ pb: 2 }}>
      <Alert
        severity="warning"
        sx={{
          borderRadius: "20px",
          border: "1px solid rgba(245, 158, 11, 0.18)",
          bgcolor: "rgba(255,251,235,0.92)",
        }}
      >
        <AlertTitle sx={{ fontWeight: "bold" }}>打刻エラー</AlertTitle>
        カレンダー上で赤色の日付をタップして確認してください
      </Alert>
    </Box>
  );
}
