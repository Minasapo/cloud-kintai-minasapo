import { Alert, Box, Button, Container, styled } from "@mui/material";
import { Logger } from "aws-amplify";
import dayjs from "dayjs";
import React, { useContext, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import { AttendanceDate } from "@/lib/AttendanceDate";

import { useAppDispatchV2 } from "../../../app/hooks";
import Clock from "../../../components/clock/Clock";
import { AppConfigContext } from "../../../context/AppConfigContext";
import useAttendance from "../../../hooks/useAttendance/useAttendance";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "../../../lib/reducers/snackbarReducer";

const ActionButton = styled(Button)(({ theme }) => ({
  color: theme.palette.clock_in.contrastText,
  backgroundColor: theme.palette.clock_in.main,
  "&.clock-out": {
    backgroundColor: theme.palette.clock_out.main,
    color: theme.palette.clock_out.contrastText,
  },
}));

const validateToken = async (timestamp: string, token: string) => {
  try {
    const secret: string | undefined = import.meta.env.VITE_TOKEN_SECRET;
    if (!secret) {
      console.error("VITE_TOKEN_SECRET is not set.");
      throw new Error("VITE_TOKEN_SECRET is not defined or invalid.");
    }

    const [receivedTimestamp, receivedSignature] = atob(token).split(":");

    // タイムスタンプが一致しない場合は無効
    if (receivedTimestamp !== timestamp) return false;

    // タイムスタンプの有効期限を確認（30秒以内に変更）
    const currentTimestamp = dayjs().unix();
    const timestampNumber = parseInt(timestamp, 10);

    // タイムラグを考慮して厳密に判定
    if (currentTimestamp - timestampNumber >= 30) return false;

    // HMAC署名を検証
    const encoder = new TextEncoder();
    const data = encoder.encode(`${timestamp}:${secret}`);
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const expectedSignature = btoa(
      Array.from(new Uint8Array(await crypto.subtle.sign("HMAC", key, data)))
        .map((b) => String.fromCharCode(b))
        .join("")
    );

    return receivedSignature === expectedSignature;
  } catch {
    return false;
  }
};

const OfficeQRRegister: React.FC = () => {
  const { getOfficeMode } = useContext(AppConfigContext);
  const [searchParams] = useSearchParams();
  const [isOfficeModeEnabled, setIsOfficeModeEnabled] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);

  const mode = searchParams.get("mode");
  const timestamp = searchParams.get("timestamp");
  const token = searchParams.get("token");

  React.useEffect(() => {
    setIsOfficeModeEnabled(getOfficeMode());
  }, [getOfficeMode]);

  React.useEffect(() => {
    const validate = async () => {
      if (timestamp && token) {
        const isValid = await validateToken(timestamp, token);
        setIsValidToken(isValid);
      }
    };
    validate();
  }, [timestamp, token]);

  if (!isOfficeModeEnabled) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Alert severity="warning">現在、使用することができません。</Alert>
        </Box>
      </Container>
    );
  }

  const dispatch = useAppDispatchV2();
  const logger = new Logger(
    "RegisterPage",
    import.meta.env.DEV ? "DEBUG" : "ERROR"
  );
  const { cognitoUser } = useContext(AuthContext);
  const { clockIn, clockOut } = useAttendance();

  const today = dayjs().format(AttendanceDate.DataFormat);

  const handleClockIn = () => {
    if (!cognitoUser) {
      return;
    }

    const now = dayjs().second(0).millisecond(0).toISOString();
    clockIn(cognitoUser.id, today, now)
      .then(() => {
        dispatch(setSnackbarSuccess("出勤が記録されました。"));
      })
      .catch((e) => {
        logger.debug(e);
        dispatch(setSnackbarError("出勤処理に失敗しました。"));
      });
  };

  const handleClockOut = () => {
    if (!cognitoUser) {
      return;
    }

    const now = dayjs().second(0).millisecond(0).toISOString();
    clockOut(cognitoUser.id, today, now)
      .then(() => {
        dispatch(setSnackbarSuccess("退勤が記録されました。"));
      })
      .catch((e) => {
        logger.debug(e);
        dispatch(setSnackbarError("退勤処理に失敗しました。"));
      });
  };

  const getErrorMessage = () => {
    if (!isValidToken) {
      return "無効なトークンです。トークンの有効期限が切れている可能性があります。";
    }
    if (mode !== "clock_in" && mode !== "clock_out") {
      return "無効なアクセスです。";
    }
    return null;
  };

  const errorMessage = getErrorMessage();

  return (
    <Container>
      {errorMessage ? (
        <Alert severity="error" sx={{ mt: 4 }}>
          {errorMessage}
        </Alert>
      ) : (
        <Box
          sx={{
            mt: 4,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Clock />
          {mode === "clock_in" && (
            <ActionButton
              variant="contained"
              className="clock-in"
              onClick={handleClockIn}
              size="large"
              sx={{
                mt: 2,
                width: 1,
                maxWidth: 350,
                height: "80px",
                fontSize: "1.5rem",
              }}
            >
              出勤
            </ActionButton>
          )}
          {mode === "clock_out" && (
            <ActionButton
              variant="contained"
              className="clock-out"
              onClick={handleClockOut}
              size="large"
              sx={{
                mt: 2,
                width: 1,
                maxWidth: 350,
                height: "80px",
                fontSize: "1.5rem",
              }}
            >
              退勤
            </ActionButton>
          )}
        </Box>
      )}
    </Container>
  );
};

export default OfficeQRRegister;
