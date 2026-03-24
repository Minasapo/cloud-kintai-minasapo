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
import { designTokenVar } from "@/shared/designSystem";
import {
  selectSnackbar,
  setSnackbarError,
  setSnackbarSuccess,
  setSnackbarWarn,
} from "@/shared/lib/store/snackbarSlice";

const SNACKBAR_ANCHOR_ORIGIN: SnackbarOrigin = {
  vertical: "top",
  horizontal: "right",
};

const SNACKBAR_TONES = {
  success: {
    background: designTokenVar("color.feedback.success.surface", "#ECF8F1"),
    color: designTokenVar("color.neutral.900", "#1E2A25"),
    border: designTokenVar(
      "color.feedback.success.border",
      "rgba(30, 170, 106, 0.4)",
    ),
    icon: designTokenVar("color.feedback.success.base", "#1EAA6A"),
  },
  error: {
    background: designTokenVar("color.feedback.danger.surface", "#FDECEC"),
    color: designTokenVar("color.neutral.900", "#1E2A25"),
    border: designTokenVar(
      "color.feedback.danger.border",
      "rgba(215, 68, 62, 0.4)",
    ),
    icon: designTokenVar("color.feedback.danger.base", "#D7443E"),
  },
  warning: {
    background: designTokenVar("color.feedback.warning.surface", "#FFF7EA"),
    color: designTokenVar("color.neutral.900", "#1E2A25"),
    border: designTokenVar(
      "color.feedback.warning.border",
      "rgba(232, 164, 71, 0.4)",
    ),
    icon: designTokenVar("color.feedback.warning.base", "#E8A447"),
  },
} as const;

const SNACKBAR_BASE_OFFSET_PX = 16;
const SNACKBAR_STACK_GAP_PX = 10;
const SNACKBAR_APPROX_HEIGHT_PX = 60;
const SNACKBAR_WIDTH = "min(460px, calc(100vw - 24px))";

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
        zIndex: 1600,
        width: SNACKBAR_WIDTH,
        "&.MuiSnackbar-anchorOriginTopRight": {
          top: `${getSnackbarTopOffset(stackIndex)}px`,
          right: "12px",
        },
      }}
    >
      <Alert
        variant="standard"
        severity={severity}
        elevation={0}
        sx={{
          backgroundColor: SNACKBAR_TONES[severity].background,
          color: SNACKBAR_TONES[severity].color,
          border: `1px solid ${SNACKBAR_TONES[severity].border}`,
          borderRadius: designTokenVar("radius.lg", "12px"),
          opacity: 1,
          width: "100%",
          boxShadow: designTokenVar(
            "shadow.overlay",
            "0 12px 34px rgba(17, 24, 39, 0.2)",
          ),
          alignItems: "center",
          px: designTokenVar("spacing.xs", "4px"),
          py: designTokenVar("spacing.xs", "4px"),
          "& .MuiAlert-icon": {
            color: SNACKBAR_TONES[severity].icon,
            py: 0.25,
          },
          "& .MuiAlert-message": {
            fontWeight: 500,
            letterSpacing: "0.01em",
            lineHeight: 1.4,
          },
          "& .MuiAlert-action": {
            pl: 1,
            pt: 0,
            pb: 0,
          },
        }}
        action={
          <IconButton
            color="inherit"
            size="small"
            onClick={onClose}
            aria-label="Close notification"
            sx={{
              opacity: 0.8,
              "&:hover": {
                opacity: 1,
              },
            }}
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
