import { useCallback } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import {
  type NotificationPlacement,
  type NotificationSource,
  type NotificationTone,
  pushNotification,
} from "@/shared/lib/store/notificationSlice";

export type AppNotificationInput = {
  title: string;
  description?: string;
  tone: NotificationTone;
  dedupeKey?: string;
  autoHideMs?: number | null;
  placement?: NotificationPlacement;
  source?: NotificationSource;
};

export const useAppNotification = () => {
  const dispatch = useAppDispatchV2();

  const notify = useCallback(
    ({
      title,
      description,
      tone,
      dedupeKey,
      autoHideMs,
      placement,
      source,
    }: AppNotificationInput) => {
      dispatch(
        pushNotification({
          message: title,
          description,
          tone,
          dedupeKey,
          autoHideMs,
          placement,
          source,
        }),
      );
    },
    [dispatch],
  );

  return { notify };
};
