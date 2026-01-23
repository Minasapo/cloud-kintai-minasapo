// cspell:ignore notistack
import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  IconButton,
  Snackbar,
  type SnackbarCloseReason,
  type SnackbarOrigin,
} from "@mui/material";
import { useCallback } from "react";

import { useAppDispatchV2, useAppSelectorV2 } from "@/app/hooks";
import { SNACKBAR_AUTO_HIDE_DURATION } from "@/shared/config/timeouts";
import {
  selectSnackbar,
  setSnackbarError,
  setSnackbarSuccess,
  setSnackbarWarn,
} from "@/app/slices/snackbarSlice";

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

  // Handle close actions by clearing Redux state
  const handleCloseSuccess = useCallback(() => {
    dispatch(setSnackbarSuccess(null));
  }, [dispatch]);

  const handleCloseError = useCallback(() => {
    dispatch(setSnackbarError(null));
  }, [dispatch]);

  const handleCloseWarn = useCallback(() => {
    dispatch(setSnackbarWarn(null));
  }, [dispatch]);

  const renderSnackbar = (
    key: string,
    message: string,
    severity: "success" | "error" | "warning",
    autoHideDuration: number | null,
    onClose: () => void,
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
        onClose();
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
          <IconButton color="inherit" size="small" onClick={onClose}>
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
      message: success,
      severity: "success" as const,
      autoHideDuration: SNACKBAR_AUTO_HIDE_DURATION.SUCCESS,
      onClose: handleCloseSuccess,
    },
    {
      key: "error",
      message: error,
      severity: "error" as const,
      autoHideDuration: null,
      onClose: handleCloseError,
    },
    {
      key: "warn",
      message: warn,
      severity: "warning" as const,
      autoHideDuration: SNACKBAR_AUTO_HIDE_DURATION.ERROR,
      onClose: handleCloseWarn,
    },
  ];

  let stackIndex = 0;

  return (
    <>
      {snackbarConfigs.map(
        ({ key, message, severity, autoHideDuration, onClose }) => {
          if (!message) {
            return null;
          }
          const element = renderSnackbar(
            key,
            message,
            severity,
            autoHideDuration,
            onClose,
            stackIndex
          );
          stackIndex += 1;
          return element;
        }
      )}
    </>
  );
}
