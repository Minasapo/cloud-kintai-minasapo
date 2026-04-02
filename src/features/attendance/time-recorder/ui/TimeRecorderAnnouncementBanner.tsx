import { useEffect, useMemo, useState } from "react";

import {
  buildTimeRecorderAnnouncementDismissKey,
  dismissTimeRecorderAnnouncement,
  isDismissedTimeRecorderAnnouncement,
  shouldShowTimeRecorderAnnouncement,
  type TimeRecorderAnnouncement,
} from "@/features/attendance/time-recorder/lib/timeRecorderAnnouncement";

type TimeRecorderAnnouncementBannerProps = {
  configId: string | null;
  announcement: TimeRecorderAnnouncement;
};

export default function TimeRecorderAnnouncementBanner({
  configId,
  announcement,
}: TimeRecorderAnnouncementBannerProps) {
  const dismissKey = useMemo(
    () =>
      buildTimeRecorderAnnouncementDismissKey(configId, announcement.message),
    [configId, announcement.message],
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(isDismissedTimeRecorderAnnouncement(localStorage, dismissKey));
  }, [dismissKey]);

  if (!shouldShowTimeRecorderAnnouncement(announcement, dismissed)) {
    return null;
  }

  const handleClose = () => {
    dismissTimeRecorderAnnouncement(localStorage, dismissKey);
    setDismissed(true);
  };

  return (
    <div className="sticky top-0 z-40 px-3 pt-3 md:px-4 md:pt-4">
      <div
        role="status"
        data-testid="time-recorder-announcement-banner"
        className="mx-auto flex w-full max-w-3xl items-start gap-3 rounded-[4px] border border-cyan-200 bg-cyan-50/95 px-4 py-3 text-cyan-950 shadow-[0_14px_28px_-22px_rgba(8,145,178,0.55)] backdrop-blur"
      >
        <p className="m-0 flex-1 whitespace-pre-wrap text-sm font-medium leading-6">
          {announcement.message}
        </p>
        <button
          type="button"
          onClick={handleClose}
          data-testid="time-recorder-announcement-close-button"
          aria-label="打刻画面アナウンスを閉じる"
          className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-cyan-300 bg-white text-cyan-700 transition hover:border-cyan-400 hover:text-cyan-900"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </div>
  );
}
