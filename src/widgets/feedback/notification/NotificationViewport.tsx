import { useEffect } from "react";

import { useAppDispatchV2, useAppSelectorV2 } from "@/app/hooks";
import { designTokenVar } from "@/shared/designSystem";
import {
  dismissNotification,
  type NotificationItem,
  type NotificationTone,
  selectNotifications,
} from "@/shared/lib/store/notificationSlice";
import { APP_LAYER_Z_INDEX } from "@/shared/ui/overlay/layers";
import OverlayPortal from "@/shared/ui/overlay/OverlayPortal";

const NOTIFICATION_TONES: Record<
  NotificationTone,
  {
    background: string;
    color: string;
    border: string;
    icon: string;
  }
> = {
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
  info: {
    background: designTokenVar("color.feedback.info.surface", "#EDF2FC"),
    color: designTokenVar("color.neutral.900", "#1E2A25"),
    border: designTokenVar(
      "color.feedback.info.border",
      "rgba(60, 126, 219, 0.4)",
    ),
    icon: designTokenVar("color.feedback.info.base", "#3C7EDB"),
  },
};

const NOTIFICATION_STACK_GAP_PX = 10;
const NOTIFICATION_WIDTH = "min(460px, calc(100vw - 24px))";
const iconClassName = "h-4 w-4 shrink-0";

function ToneIcon({ tone }: { tone: NotificationTone }) {
  if (tone === "success") {
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

  if (tone === "error") {
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

  if (tone === "warning") {
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

  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={iconClassName}>
      <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.2" />
      <path
        d="M10 10.2V6.4m0 6.8h.01"
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

function NotificationCard({
  notification,
}: {
  notification: NotificationItem;
}) {
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    if (notification.autoHideMs === null) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      dispatch(dismissNotification(notification.id));
    }, notification.autoHideMs);

    return () => window.clearTimeout(timeoutId);
  }, [dispatch, notification.autoHideMs, notification.id]);

  return (
    <div
      role="alert"
      aria-live={notification.tone === "error" ? "assertive" : "polite"}
      className="pointer-events-auto"
      style={{ width: NOTIFICATION_WIDTH }}
    >
      <div
        className="flex w-full items-center gap-2 rounded-[12px] border px-3 py-2 shadow-[0_12px_34px_rgba(17,24,39,0.2)]"
        style={{
          backgroundColor: NOTIFICATION_TONES[notification.tone].background,
          color: NOTIFICATION_TONES[notification.tone].color,
          borderColor: NOTIFICATION_TONES[notification.tone].border,
        }}
      >
        <span style={{ color: NOTIFICATION_TONES[notification.tone].icon }}>
          <ToneIcon tone={notification.tone} />
        </span>

        <p className="m-0 min-w-0 flex-1 text-sm font-medium leading-6 tracking-[0.01em]">
          {notification.message}
        </p>

        <button
          type="button"
          onClick={() => dispatch(dismissNotification(notification.id))}
          aria-label="Close notification"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-current opacity-80 transition hover:opacity-100"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

export default function NotificationViewport() {
  const notifications = useAppSelectorV2(selectNotifications);

  if (notifications.length === 0) {
    return null;
  }

  const topRightNotifications = notifications.filter(
    (item) => item.placement === "top-right",
  );
  const bottomRightNotifications = notifications
    .filter((item) => item.placement === "bottom-right")
    .slice(-3);

  return (
    <OverlayPortal>
      <>
        {topRightNotifications.length > 0 ? (
          <div
            data-testid="notification-viewport-top-right"
            className="pointer-events-none fixed right-3 top-4 flex flex-col"
            style={{
              zIndex: APP_LAYER_Z_INDEX.notification,
              gap: `${NOTIFICATION_STACK_GAP_PX}px`,
            }}
          >
            {topRightNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        ) : null}

        {bottomRightNotifications.length > 0 ? (
          <div
            data-testid="notification-viewport-bottom-right"
            className="pointer-events-none fixed bottom-6 right-6 flex flex-col"
            style={{
              zIndex: APP_LAYER_Z_INDEX.notification,
              gap: `${NOTIFICATION_STACK_GAP_PX}px`,
            }}
          >
            {bottomRightNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        ) : null}
      </>
    </OverlayPortal>
  );
}
