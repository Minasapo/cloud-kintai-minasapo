import {
  Alert,
  Box,
  Button,
  Container,
  LinearProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { QRCodeCanvas } from "qrcode.react";
import React, { useContext, useEffect, useState } from "react";

import { AuthContext } from "@/context/AuthContext";
import { StaffRole } from "@/hooks/useStaffs/useStaffs";

import { AppConfigContext } from "../../../context/AppConfigContext";

const generateToken = async (timestamp: number) => {
  const secret = import.meta.env.VITE_TOKEN_SECRET || "default_secret";
  const encoder = new TextEncoder();
  const data = encoder.encode(`${timestamp}:${secret}`);
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = btoa(
    Array.from(new Uint8Array(await crypto.subtle.sign("HMAC", key, data)))
      .map((b) => String.fromCharCode(b))
      .join("")
  );
  return btoa(`${timestamp}:${signature}`);
};

const OfficeQRView: React.FC = () => {
  const { isCognitoUserRole } = useContext(AuthContext);
  const { getOfficeMode } = useContext(AppConfigContext);
  const [qrValue, setQrValue] = useState<string>("");
  const [progress, setProgress] = useState(100);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isRegisterMode, setIsRegisterMode] = useState(true);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [showAdminAlert, setShowAdminAlert] = useState(false);
  const [isOfficeModeEnabled, setIsOfficeModeEnabled] = useState(false);

  const updateQRValue = async () => {
    const timestamp = dayjs().unix();
    const token = await generateToken(timestamp);
    const newQrValue = `${
      import.meta.env.VITE_BASE_PATH
    }/office/qr/register?timestamp=${timestamp}&token=${token}`;
    setQrValue(newQrValue);
    setProgress(100);
    setTimeLeft(30); // カウントダウンをリセット
  };

  useEffect(() => {
    updateQRValue();

    const totalDuration = 30;
    const intervalDuration = 50;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTimeLeft = prev - intervalDuration / 1000;
        if (newTimeLeft <= 0) {
          updateQRValue();
          return totalDuration;
        }
        return newTimeLeft;
      });

      setProgress((prev) => {
        const newProgress =
          prev - (100 / (totalDuration * 1000)) * intervalDuration;
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, intervalDuration);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateQRValue();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    setIsOfficeModeEnabled(getOfficeMode());
  }, [getOfficeMode]);

  useEffect(() => {
    if (isCognitoUserRole(StaffRole.ADMIN)) {
      setShowAdminAlert(true);
    }
  }, [isCognitoUserRole]);

  if (!isOfficeModeEnabled) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Alert severity="warning">現在、使用することができません。</Alert>
        </Box>
      </Container>
    );
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  const handleModeChange = () => {
    setIsRegisterMode((prev) => !prev);
  };

  const handleCopyURL = () => {
    const urlToCopy = `${qrValue}&mode=${
      isRegisterMode ? "clock_in" : "clock_out"
    }`;
    navigator.clipboard.writeText(urlToCopy);
    setTooltipOpen(true);
    setTimeout(() => setTooltipOpen(false), 2000);
  };

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
          onClick={handleModeChange}
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
          <QRCodeCanvas
            value={`${qrValue}&mode=${
              isRegisterMode ? "clock_in" : "clock_out"
            }`}
            size={500}
          />
        </Box>
        <Box sx={{ my: 2, display: "flex", justifyContent: "center", gap: 2 }}>
          <Tooltip
            title="URLがコピーされました！"
            open={tooltipOpen}
            disableFocusListener
            disableHoverListener
            disableTouchListener
          >
            <Button variant="outlined" color="primary" onClick={handleCopyURL}>
              URLをコピー
            </Button>
          </Tooltip>
          <Button variant="outlined" color="primary" onClick={updateQRValue}>
            QRコードを手動更新
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default OfficeQRView;
