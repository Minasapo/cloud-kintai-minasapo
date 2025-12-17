// cspell:ignore notistack
import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  IconButton,
  Snackbar,
  type SnackbarCloseReason,
  type SnackbarOrigin,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import { useAppDispatchV2, useAppSelectorV2 } from "../../app/hooks";
import {
  selectSnackbar,
  setSnackbarError,
  setSnackbarSuccess,
  setSnackbarWarn,
} from "../../lib/reducers/snackbarReducer";

const SNACKBAR_ANCHOR_ORIGIN: SnackbarOrigin = {
  vertical: "top",
  horizontal: "right",
};

const SNACKBAR_COLORS = {
  success: "#7fff7f",
  error: "#ff7f7f",
  warn: "#ffff7f",
} as const;

export default function SnackbarGroup() {
  const { success, error, warn } = useAppSelectorV2(selectSnackbar);
  const dispatch = useAppDispatchV2();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warnMessage, setWarnMessage] = useState<string | null>(null);

  const resetSuccess = useCallback(() => {
    dispatch(setSnackbarSuccess(null));
  }, [dispatch]);

  const resetError = useCallback(() => {
    dispatch(setSnackbarError(null));
  }, [dispatch]);

  const resetWarn = useCallback(() => {
    dispatch(setSnackbarWarn(null));
  }, [dispatch]);

  useEffect(() => {
    if (!success) {
      return;
    }
    setSuccessMessage(success);
    resetSuccess();
  }, [resetSuccess, success]);

  useEffect(() => {
    if (!error) {
      return;
    }
    setErrorMessage(error);
    resetError();
  }, [error, resetError]);

  useEffect(() => {
    if (!warn) {
      return;
    }
    setWarnMessage(warn);
    resetWarn();
  }, [resetWarn, warn]);

  const renderSnackbar = (
    message: string | null,
    severity: "success" | "error" | "warning",
    autoHideDuration: number | null,
    setMessage: React.Dispatch<React.SetStateAction<string | null>>
  ) => (
    <Snackbar
      open={Boolean(message)}
      anchorOrigin={SNACKBAR_ANCHOR_ORIGIN}
      autoHideDuration={autoHideDuration ?? undefined}
      onClose={(_event, reason?: SnackbarCloseReason) => {
        if (reason === "clickaway") {
          return;
        }
        setMessage(null);
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

  return (
    <>
      {renderSnackbar(
        successMessage,
        "success",
        6000,
        setSuccessMessage
      )}
      {renderSnackbar(
        errorMessage,
        "error",
        null,
        setErrorMessage
      )}
      {renderSnackbar(
        warnMessage,
        "warning",
        5000,
        setWarnMessage
      )}
    </>
  );
}
