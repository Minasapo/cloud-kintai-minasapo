import { useEffect } from "react";

const AUTO_SAVE_DELAY = 1000;

type UseQuickDailyReportAutoSaveParams = {
  staffId: string | null | undefined;
  content: string;
  savedContent: string;
  handleSave: (
    showNotification?: boolean,
    isManualSave?: boolean,
  ) => Promise<void>;
};

export function useQuickDailyReportAutoSave({
  staffId,
  content,
  savedContent,
  handleSave,
}: UseQuickDailyReportAutoSaveParams) {
  useEffect(() => {
    if (!staffId) return;
    if (content === savedContent) return;
    if (content.trim() === "") return;
    const timerId = setTimeout(() => {
      void handleSave(false, false);
    }, AUTO_SAVE_DELAY);
    return () => {
      clearTimeout(timerId);
    };
  }, [content, savedContent, staffId, handleSave]);
}
