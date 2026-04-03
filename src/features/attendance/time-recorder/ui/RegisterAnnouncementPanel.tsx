import { useEffect, useMemo, useState } from "react";

import {
  buildTimeRecorderAnnouncementDismissKey,
  isDismissedTimeRecorderAnnouncement,
  shouldShowTimeRecorderAnnouncement,
  type TimeRecorderAnnouncement,
} from "@/features/attendance/time-recorder/lib/timeRecorderAnnouncement";

type RegisterAnnouncementPanelProps = {
  configId?: string | null;
  announcement?: TimeRecorderAnnouncement;
};

export default function RegisterAnnouncementPanel({
  configId = null,
  announcement = { enabled: false, message: "" },
}: RegisterAnnouncementPanelProps) {
  const dismissKey = useMemo(
    () =>
      buildTimeRecorderAnnouncementDismissKey(configId, announcement.message),
    [configId, announcement.message],
  );
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  useEffect(() => {
    setAnnouncementDismissed(
      isDismissedTimeRecorderAnnouncement(localStorage, dismissKey),
    );
  }, [dismissKey]);

  const showAnnouncement = shouldShowTimeRecorderAnnouncement(
    announcement,
    announcementDismissed,
  );

  return (
    <div
      data-testid="register-dashboard-panel"
      className="w-full space-y-4"
      aria-label="勤怠ダッシュボード"
    >
      {showAnnouncement && (
        <section
          data-testid="register-dashboard-announcement-card"
          className="sticky top-4 z-20 rounded-[4px] border border-slate-200/80 bg-white p-4 shadow-[0_18px_32px_-28px_rgba(15,23,42,0.35)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="m-0 text-sm font-semibold tracking-[0.01em] text-slate-900">
                アナウンス
              </h2>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {announcement.message}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
