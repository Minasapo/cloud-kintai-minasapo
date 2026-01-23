import { useAppDispatchV2 } from "@app/hooks";
import { useEffect } from "react";

import { setSnackbarError } from "@/shared/lib/store/snackbarSlice";

/**
 * 重複した勤怠データの警告をリッスンし、スナックバーで表示するカスタムフック
 */
export const useDuplicateAttendanceWarning = () => {
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    const handleDuplicateWarning = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string }>;
      if (customEvent.detail?.message) {
        dispatch(setSnackbarError(customEvent.detail.message));
      }
    };

    window.addEventListener(
      "attendance-duplicate-warning",
      handleDuplicateWarning
    );

    return () => {
      window.removeEventListener(
        "attendance-duplicate-warning",
        handleDuplicateWarning
      );
    };
  }, [dispatch]);
};
