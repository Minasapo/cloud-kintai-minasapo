import { useAppDispatchV2, useAppSelectorV2 } from "@app/hooks";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { designTokenVar } from "@shared/designSystem";
import {
  dismissNotification,
  type NotificationItem,
  type NotificationTone,
  selectNotifications,
} from "@shared/lib/store/notificationSlice";
import { AppIconButton } from "@shared/ui/button";
import { APP_LAYER_Z_INDEX } from "@shared/ui/overlay/layers";
import OverlayPortal from "@shared/ui/overlay/OverlayPortal";
import { useEffect } from "react";

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
    background: designTokenVar("color.feedback.success.surface"),
    color: designTokenVar("color.neutral.900"),
    border: designTokenVar("color.feedback.success.border"),
    icon: designTokenVar("color.feedback.success.base"),
  },
  error: {
    background: designTokenVar("color.feedback.danger.surface"),
    color: designTokenVar("color.neutral.900"),
    border: designTokenVar("color.feedback.danger.border"),
    icon: designTokenVar("color.feedback.danger.base"),
  },
  warning: {
    background: designTokenVar("color.feedback.warning.surface"),
    color: designTokenVar("color.neutral.900"),
    border: designTokenVar("color.feedback.warning.border"),
    icon: designTokenVar("color.feedback.warning.base"),
  },
  info: {
    background: designTokenVar("color.feedback.info.surface"),
    color: designTokenVar("color.neutral.900"),
    border: designTokenVar("color.feedback.info.border"),
    icon: designTokenVar("color.feedback.info.base"),
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

        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm font-medium leading-6 tracking-[0.01em]">
            {notification.message}
          </p>
          {notification.description ? (
            <p className="m-0 text-sm leading-5 opacity-80">
              {notification.description}
            </p>
          ) : null}
        </div>

        <AppIconButton
          onClick={() => dispatch(dismissNotification(notification.id))}
          aria-label="Close notification"
          tone="neutral"
          size="sm"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full p-0 text-current opacity-80 transition hover:opacity-100"
        >
          <CloseRoundedIcon className="h-4 w-4" />
        </AppIconButton>
      </div>
    </div>
  );
}

export default function NotificationViewport() {
  const notifications: NotificationItem[] =
    useAppSelectorV2(selectNotifications);

  if (notifications.length === 0) {
    return null;
  }

  const topRightNotifications: NotificationItem[] = notifications.filter(
    (item) => item.placement === "top-right",
  );
  const bottomRightNotifications: NotificationItem[] = notifications
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
