import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  LinearProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import { lazy, Suspense } from "react";

export type OfficeQrPanelProps = {
  showAdminAlert: boolean;
  isOfficeModeEnabled: boolean;
  isRegisterMode: boolean;
  timeLeft: number;
  progress: number;
  qrUrl: string;
  tooltipOpen: boolean;
  onModeChange: () => void;
  onCopyUrl: () => void;
  onManualRefresh: () => void;
};

const LazyQRCodeCanvas = lazy(async () => {
  const module = await import("qrcode.react");
  return { default: module.QRCodeCanvas };
});

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export function OfficeQrPanel({
  showAdminAlert,
  isOfficeModeEnabled,
  isRegisterMode,
  timeLeft,
  progress,
  qrUrl,
  tooltipOpen,
  onModeChange,
  onCopyUrl,
  onManualRefresh,
}: OfficeQrPanelProps) {
  if (!isOfficeModeEnabled) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Alert severity="warning" data-testid="office-qr-disabled-alert">
            現在、使用することができません。
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      {showAdminAlert && (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Alert severity="warning" data-testid="office-qr-admin-alert">
            管理者権限で表示されています。オペレーター権限を持ったアカウントで表示してから運用してください。
          </Alert>
        </Box>
      )}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Button
          variant="contained"
          color={isRegisterMode ? "primary" : "secondary"}
          onClick={onModeChange}
          sx={{ fontSize: "1.2rem", padding: "10px 20px", mr: 2 }}
          data-testid="office-qr-mode-toggle"
        >
          {isRegisterMode ? "出勤モード" : "退勤モード"}
        </Button>
      </Box>
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2" gutterBottom data-testid="office-qr-timer">
          次の更新までの時間: {formatTime(timeLeft)}
        </Typography>
        <Box sx={{ width: "500px", margin: "0 auto" }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 30,
            }}
            data-testid="office-qr-progress"
          />
        </Box>
      </Box>
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body1" gutterBottom>
          以下のQRコードをスキャンしてください。
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Suspense
            fallback={
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress aria-label="QRコード生成中" />
              </Box>
            }
          >
            <LazyQRCodeCanvas
              value={qrUrl}
              size={500}
              data-testid="office-qr-code"
              aria-label="office-qr-code"
            />
          </Suspense>
        </Box>
        <Box sx={{ my: 2, display: "flex", justifyContent: "center", gap: 2 }}>
          <Tooltip
            title="URLがコピーされました！"
            open={tooltipOpen}
            disableFocusListener
            disableHoverListener
            disableTouchListener
          >
            <Button
              variant="outlined"
              color="primary"
              onClick={onCopyUrl}
              data-testid="office-qr-copy-button"
            >
              URLをコピー
            </Button>
          </Tooltip>
          <Button
            variant="outlined"
            color="primary"
            onClick={onManualRefresh}
            data-testid="office-qr-refresh-button"
          >
            QRコードを手動更新
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
