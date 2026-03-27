import { useCallback, useEffect } from "react";

import { useAppDispatchV2, useAppSelectorV2 } from "@/app/hooks";
import { SNACKBAR_AUTO_HIDE_DURATION } from "@/shared/config/timeouts";
import { designTokenVar } from "@/shared/designSystem";
import {
  selectSnackbar,
  setSnackbarError,
  setSnackbarSuccess,
  setSnackbarWarn,
} from "@/shared/lib/store/snackbarSlice";

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

const iconClassName = "h-4 w-4 shrink-0";

function SeverityIcon({ severity }: { severity: "success" | "error" | "warning" }) {
  if (severity === "success") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true" className={iconClassName}>
        <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.2" />
        <path
          d="M6 10.4 8.7 13l5.3-5.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (severity === "error") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true" className={iconClassName}>
        <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.2" />
        <path
          d="M7 7l6 6m0-6-6 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={iconClassName}>
      <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.2" />
      <path
        d="M10 5.8v5.8m0 2.6h.01"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
      <path
        d="M5 5l10 10M15 5 5 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SnackbarGroup() {
  const { success, error, warn } = useAppSelectorV2(selectSnackbar);
  const dispatch = useAppDispatchV2();

  const handleCloseSuccess = useCallback(() => {
    dispatch(setSnackbarSuccess(null));
  }, [dispatch]);

  const handleCloseError = useCallback(() => {
    dispatch(setSnackbarError(null));
  }, [dispatch]);

  const handleCloseWarn = useCallback(() => {
    dispatch(setSnackbarWarn(null));
  }, [dispatch]);

  useEffect(() => {
    if (!success) return;
    const timeoutId = window.setTimeout(
      handleCloseSuccess,
      SNACKBAR_AUTO_HIDE_DURATION.SUCCESS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [success, handleCloseSuccess]);

  useEffect(() => {
    if (!warn) return;
    const timeoutId = window.setTimeout(
      handleCloseWarn,
      SNACKBAR_AUTO_HIDE_DURATION.ERROR,
    );
    return () => window.clearTimeout(timeoutId);
  }, [warn, handleCloseWarn]);

  const snackbarConfigs = [
    {
      key: "success",
      message: success,
      severity: "success" as const,
      onClose: handleCloseSuccess,
    },
    {
      key: "error",
      message: error,
      severity: "error" as const,
      onClose: handleCloseError,
    },
    {
      key: "warn",
      message: warn,
      severity: "warning" as const,
      onClose: handleCloseWarn,
    },
  ];

  let stackIndex = 0;

  return (
    <>
      {snackbarConfigs.map(({ key, message, severity, onClose }) => {
        if (!message) {
          return null;
        }

        const topOffset = getSnackbarTopOffset(stackIndex);
        stackIndex += 1;

        return (
          <div
            key={key}
            role="alert"
            aria-live={severity === "error" ? "assertive" : "polite"}
            className="fixed right-3 z-[1600]"
            style={{
              top: `${topOffset}px`,
              width: SNACKBAR_WIDTH,
            }}
          >
            <div
              className="flex w-full items-center gap-2 rounded-[12px] border px-3 py-2 shadow-[0_12px_34px_rgba(17,24,39,0.2)]"
              style={{
                backgroundColor: SNACKBAR_TONES[severity].background,
                color: SNACKBAR_TONES[severity].color,
                borderColor: SNACKBAR_TONES[severity].border,
              }}
            >
              <span style={{ color: SNACKBAR_TONES[severity].icon }}>
                <SeverityIcon severity={severity} />
              </span>

              <p className="m-0 min-w-0 flex-1 text-sm font-medium leading-6 tracking-[0.01em]">
                {message}
              </p>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close notification"
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-current opacity-80 transition hover:opacity-100"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}
