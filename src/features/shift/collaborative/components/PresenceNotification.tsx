import { useCallback } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { pushNotification } from "@/shared/lib/store/notificationSlice";

export type PresenceNotificationType =
  | "user-joined"
  | "user-left"
  | "cell-editing-started"
  | "cell-editing-stopped"
  | "data-synced";

export interface PresenceNotification {
  id: string;
  type: PresenceNotificationType;
  userName: string;
  timestamp: number;
  cellInfo?: {
    staffName: string;
    date: string;
  };
}

const getPresenceMessage = (notification: PresenceNotification) => {
  switch (notification.type) {
    case "user-joined":
      return `${notification.userName} が参加しました`;
    case "user-left":
      return `${notification.userName} が退出しました`;
    case "cell-editing-started":
      return notification.cellInfo
        ? `${notification.userName} が ${notification.cellInfo.staffName} の ${notification.cellInfo.date} を編集中です`
        : `${notification.userName} がセルを編集中です`;
    case "cell-editing-stopped":
      return notification.cellInfo
        ? `${notification.userName} が ${notification.cellInfo.staffName} の ${notification.cellInfo.date} の編集を終了しました`
        : `${notification.userName} が編集を終了しました`;
    case "data-synced":
      return notification.cellInfo
        ? `${notification.cellInfo.staffName} のシフトが更新されました`
        : "他のユーザーがシフトを更新しました";
    default:
      return "";
  }
};

const getPresenceTone = (
  type: PresenceNotificationType,
): "info" | "success" | "warning" | "error" => {
  switch (type) {
    case "user-joined":
      return "success";
    case "user-left":
      return "info";
    case "cell-editing-started":
      return "warning";
    case "cell-editing-stopped":
      return "info";
    case "data-synced":
      return "info";
    default:
      return "info";
  }
};

/**
 * プレゼンス通知を管理するカスタムフック
 */
export const usePresenceNotifications = () => {
  const dispatch = useAppDispatchV2();

  const addNotification = useCallback(
    (
      type: PresenceNotificationType,
      userName: string,
      cellInfo?: { staffName: string; date: string },
    ) => {
      const notification: PresenceNotification = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        userName,
        timestamp: Date.now(),
        cellInfo,
      };
      dispatch(
        pushNotification({
          id: notification.id,
          message: getPresenceMessage(notification),
          tone: getPresenceTone(notification.type),
          placement: "bottom-right",
          autoHideMs: 4000,
          source: "presence",
        }),
      );
    },
    [dispatch],
  );

  return {
    addNotification,
  };
};
