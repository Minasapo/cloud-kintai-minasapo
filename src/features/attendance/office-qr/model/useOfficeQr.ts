import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { generateOfficeQrToken } from "../lib/generateToken";

const TOTAL_DURATION = 30;
const INTERVAL_DURATION_MS = 50;

const OFFICE_MODE_CLOCK_IN = "clock_in" as const;
const OFFICE_MODE_CLOCK_OUT = "clock_out" as const;

const getUnixTimestamp = () => Math.floor(Date.now() / 1000);

export function useOfficeQr() {
  const [baseQrValue, setBaseQrValue] = useState("");
  const [progress, setProgress] = useState(100);
  const [timeLeft, setTimeLeft] = useState(TOTAL_DURATION);
  const [isRegisterMode, setIsRegisterMode] = useState(true);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipTimeoutRef = useRef<number | undefined>(undefined);

  const updateQrValue = useCallback(async () => {
    const timestamp = getUnixTimestamp();
    const token = await generateOfficeQrToken(timestamp);
    const basePath = import.meta.env.VITE_BASE_PATH || "";
    const newQrValue = `${basePath}/office/qr/register?timestamp=${timestamp}&token=${token}`;

    setBaseQrValue(newQrValue);
    setProgress(100);
    setTimeLeft(TOTAL_DURATION);
  }, []);

  useEffect(() => {
    updateQrValue();

    const intervalId = window.setInterval(() => {
      setTimeLeft((prev) => {
        const nextValue = prev - INTERVAL_DURATION_MS / 1000;
        if (nextValue <= 0) {
          void updateQrValue();
          return TOTAL_DURATION;
        }
        return nextValue;
      });

      setProgress((prev) => {
        const nextValue =
          prev - (100 / (TOTAL_DURATION * 1000)) * INTERVAL_DURATION_MS;
        return nextValue <= 0 ? 0 : nextValue;
      });
    }, INTERVAL_DURATION_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void updateQrValue();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [updateQrValue]);

  const mode = isRegisterMode ? OFFICE_MODE_CLOCK_IN : OFFICE_MODE_CLOCK_OUT;

  const qrUrl = useMemo(() => {
    if (!baseQrValue) return "";
    return `${baseQrValue}&mode=${mode}`;
  }, [baseQrValue, mode]);

  const handleModeChange = useCallback(() => {
    setIsRegisterMode((prev) => !prev);
  }, []);

  const handleManualRefresh = useCallback(() => {
    void updateQrValue();
  }, [updateQrValue]);

  const handleCopyUrl = useCallback(async () => {
    if (!qrUrl) return;

    await navigator.clipboard.writeText(qrUrl);
    setTooltipOpen(true);

    if (tooltipTimeoutRef.current !== undefined) {
      window.clearTimeout(tooltipTimeoutRef.current);
    }

    tooltipTimeoutRef.current = window.setTimeout(() => {
      setTooltipOpen(false);
    }, 2000);
  }, [qrUrl]);

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current !== undefined) {
        window.clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  return {
    qrUrl,
    timeLeft,
    progress,
    isRegisterMode,
    tooltipOpen,
    handleModeChange,
    handleManualRefresh,
    handleCopyUrl,
  } as const;
}
