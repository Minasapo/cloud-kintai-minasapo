// cspell:ignore notistack
import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  IconButton,
  Snackbar,
  type SnackbarCloseReason,
  type SnackbarOrigin,
} from "@mui/material";
import { useCallback, useState } from "react";

import { useAppDispatchV2, useAppSelectorV2 } from "@/app/hooks";
import { SNACKBAR_AUTO_HIDE_DURATION } from "@/constants/timeouts";
import {
  selectSnackbar,
  setSnackbarError,
  setSnackbarSuccess,
  setSnackbarWarn,
} from "@/lib/reducers/snackbarReducer";

const SNACKBAR_ANCHOR_ORIGIN: SnackbarOrigin = {
  vertical: "top",
  horizontal: "right",
};

const SNACKBAR_COLORS = {
  success: "#7fff7f",
  error: "#ff7f7f",
  warn: "#ffff7f",
} as const;

const SNACKBAR_BASE_OFFSET_PX = 24;
const SNACKBAR_STACK_GAP_PX = 12;
const SNACKBAR_APPROX_HEIGHT_PX = 68;

const getSnackbarTopOffset = (stackIndex: number) =>
  SNACKBAR_BASE_OFFSET_PX +
  stackIndex * (SNACKBAR_APPROX_HEIGHT_PX + SNACKBAR_STACK_GAP_PX);

export default function SnackbarGroup() {
  const { success, error, warn } = useAppSelectorV2(selectSnackbar);
  const dispatch = useAppDispatchV2();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warnMessage, setWarnMessage] = useState<string | null>(null);

  // Capture Redux state and reset immediately when new message arrives
  const handleSuccessMessage = useCallback(
    (message: string) => {
      setSuccessMessage(message);
      dispatch(setSnackbarSuccess(null));
    },
    [dispatch]
  );

  const handleErrorMessage = useCallback(
    (message: string) => {
      setErrorMessage(message);
      dispatch(setSnackbarError(null));
    },
    [dispatch]
  );

  const handleWarnMessage = useCallback(
    (message: string) => {
      setWarnMessage(message);
      dispatch(setSnackbarWarn(null));
    },
    [dispatch]
  );

  // Trigger message capture when Redux state changes
  if (success && success !== successMessage) {
    handleSuccessMessage(success);
  }

  if (error && error !== errorMessage) {
    handleErrorMessage(error);
  }

  if (warn && warn !== warnMessage) {
    handleWarnMessage(warn);
  }

  const renderSnackbar = (
    key: string,
    message: string,
    severity: "success" | "error" | "warning",
    autoHideDuration: number | null,
    setMessage: React.Dispatch<React.SetStateAction<string | null>>,
    stackIndex: number
  ) => (
    <Snackbar
      key={key}
      open
      anchorOrigin={SNACKBAR_ANCHOR_ORIGIN}
      autoHideDuration={autoHideDuration ?? undefined}
      onClose={(_event, reason?: SnackbarCloseReason) => {
        if (reason === "clickaway") {
          return;
        }
        setMessage(null);
      }}
      sx={{
        "&.MuiSnackbar-anchorOriginTopRight": {
          top: `${getSnackbarTopOffset(stackIndex)}px`,
        },
      }}
    >
      <Alert
        variant="filled"
        severity={severity}
        icon={false}
        sx={{
          backgroundColor:
            severity === "success"
              ? SNACKBAR_COLORS.success
              : severity === "error"
              ? SNACKBAR_COLORS.error
              : SNACKBAR_COLORS.warn,
          color: "#333333",
        }}
        action={
          <IconButton
            color="inherit"
            size="small"
            onClick={() => setMessage(null)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );

  const snackbarConfigs = [
    {
      key: "success",
      message: successMessage,
      severity: "success" as const,
      autoHideDuration: SNACKBAR_AUTO_HIDE_DURATION.SUCCESS,
      setMessage: setSuccessMessage,
    },
    {
      key: "error",
      message: errorMessage,
      severity: "error" as const,
      autoHideDuration: null,
      setMessage: setErrorMessage,
    },
    {
      key: "warn",
      message: warnMessage,
      severity: "warning" as const,
      autoHideDuration: SNACKBAR_AUTO_HIDE_DURATION.ERROR,
      setMessage: setWarnMessage,
    },
  ];

  let stackIndex = 0;

  return (
    <>
      {snackbarConfigs.map(
        ({ key, message, severity, autoHideDuration, setMessage }) => {
          if (!message) {
            return null;
          }
          const element = renderSnackbar(
            key,
            message,
            severity,
            autoHideDuration,
            setMessage,
            stackIndex
          );
          stackIndex += 1;
          return element;
        }
      )}
    </>
  );
}
