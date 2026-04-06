import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { SNACKBAR_AUTO_HIDE_DURATION } from "@/shared/config/timeouts";

export type NotificationTone = "success" | "error" | "warning" | "info";
export type NotificationPlacement = "top-right" | "bottom-right";
export type NotificationSource = "global" | "presence";

export type NotificationItem = {
  id: string;
  message: string;
  description?: string;
  tone: NotificationTone;
  placement: NotificationPlacement;
  autoHideMs: number | null;
  source: NotificationSource;
  dedupeKey?: string;
};

export type PushNotificationInput = {
  id?: string;
  message: string;
  description?: string;
  tone: NotificationTone;
  placement?: NotificationPlacement;
  autoHideMs?: number | null;
  source?: NotificationSource;
  dedupeKey?: string;
};

type ClearNotificationsPayload = {
  source?: NotificationSource;
};

type NotificationState = {
  items: NotificationItem[];
};

const initialState: NotificationState = {
  items: [],
};

const createNotificationId = () =>
  `notification-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const resolveDefaultPlacement = (
  source: NotificationSource,
): NotificationPlacement => {
  if (source === "presence") {
    return "bottom-right";
  }

  return "top-right";
};

const resolveDefaultAutoHideMs = ({
  source,
  tone,
}: {
  source: NotificationSource;
  tone: NotificationTone;
}) => {
  if (source === "presence") {
    return 4000;
  }

  if (tone === "error") {
    return null;
  }

  if (tone === "success") {
    return SNACKBAR_AUTO_HIDE_DURATION.SUCCESS;
  }

  return SNACKBAR_AUTO_HIDE_DURATION.ERROR;
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    pushNotification: {
      reducer: (state, action: PayloadAction<NotificationItem>) => {
        const nextNotification = action.payload;

        if (nextNotification.dedupeKey) {
          const hasDuplicate = state.items.some(
            (item) =>
              item.source === nextNotification.source &&
              item.dedupeKey === nextNotification.dedupeKey,
          );

          if (hasDuplicate) {
            return;
          }
        }

        state.items.push(nextNotification);
      },
      prepare: (input: PushNotificationInput) => {
        const source = input.source ?? "global";

        return {
          payload: {
            id: input.id ?? createNotificationId(),
            message: input.message,
            description: input.description,
            tone: input.tone,
            placement: input.placement ?? resolveDefaultPlacement(source),
            autoHideMs:
              input.autoHideMs ??
              resolveDefaultAutoHideMs({ source, tone: input.tone }),
            source,
            dedupeKey: input.dedupeKey,
          } satisfies NotificationItem,
        };
      },
    },
    dismissNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearNotifications: (
      state,
      action: PayloadAction<ClearNotificationsPayload | undefined>,
    ) => {
      const source = action.payload?.source;
      if (!source) {
        state.items = [];
        return;
      }

      state.items = state.items.filter((item) => item.source !== source);
    },
  },
});

export const { pushNotification, dismissNotification, clearNotifications } =
  notificationsSlice.actions;

export default notificationsSlice.reducer;

export type NotificationRootState = { notifications: NotificationState };

export const selectNotifications = (state: NotificationRootState) =>
  state.notifications.items;
