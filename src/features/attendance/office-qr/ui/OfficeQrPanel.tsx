import {
  Alert,
  Box,
  Button,
  Container,
  LinearProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";

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
          <Alert severity="warning">現在、使用することができません。</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      {showAdminAlert && (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Alert severity="warning">
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
        >
          {isRegisterMode ? "出勤モード" : "退勤モード"}
        </Button>
      </Box>
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2" gutterBottom>
          次の更新までの時間: {formatTime(timeLeft)}
        </Typography>
        <Box sx={{ width: "500px", margin: "0 auto" }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 30,
            }}
          />
        </Box>
      </Box>
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body1" gutterBottom>
          以下のQRコードをスキャンしてください。
        </Typography>
        <Box sx={{ mt: 2 }}>
          <QRCodeCanvas value={qrUrl} size={500} />
        </Box>
        <Box sx={{ my: 2, display: "flex", justifyContent: "center", gap: 2 }}>
          <Tooltip
            title="URLがコピーされました！"
            open={tooltipOpen}
            disableFocusListener
            disableHoverListener
            disableTouchListener
          >
            <Button variant="outlined" color="primary" onClick={onCopyUrl}>
              URLをコピー
            </Button>
          </Tooltip>
          <Button variant="outlined" color="primary" onClick={onManualRefresh}>
            QRコードを手動更新
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
