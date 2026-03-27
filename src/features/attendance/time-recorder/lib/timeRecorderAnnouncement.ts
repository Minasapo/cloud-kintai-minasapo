export const TIME_RECORDER_ANNOUNCEMENT_DISMISS_PREFIX =
  "timeRecorderAnnouncementDismissed";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export type TimeRecorderAnnouncement = {
  enabled: boolean;
  message: string;
};

const normalizeMessage = (message: string) => message.trim();

export const buildTimeRecorderAnnouncementDismissKey = (
  configId: string | null,
  message: string,
) =>
  `${TIME_RECORDER_ANNOUNCEMENT_DISMISS_PREFIX}:${configId ?? "default"}:${normalizeMessage(message)}`;

export const isDismissedTimeRecorderAnnouncement = (
  storage: StorageLike,
  key: string,
) => storage.getItem(key) === "1";

export const dismissTimeRecorderAnnouncement = (
  storage: StorageLike,
  key: string,
) => {
  storage.setItem(key, "1");
};

export const shouldShowTimeRecorderAnnouncement = (
  announcement: TimeRecorderAnnouncement,
  dismissed: boolean,
) => announcement.enabled && normalizeMessage(announcement.message).length > 0 && !dismissed;
