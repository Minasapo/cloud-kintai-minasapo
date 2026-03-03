import {
  LocalNotificationManager,
  type LocalNotificationOptions,
} from "@shared/lib/localNotification";
import { createLogger } from "@shared/lib/logger";

const logger = createLogger("useLocalNotification");
import { useCallback, useEffect, useState } from "react";

interface UseLocalNotificationReturn {
  /** 通知を表示する */
  notify: (
    title: string,
    options?: LocalNotificationOptions,
  ) => Promise<Notification | null>;
  /** 権限をリクエストする */
  requestPermission: () => Promise<"default" | "granted" | "denied">;
  /** 権限状態 */
  permission: "default" | "granted" | "denied";
  /** 通知がサポートされているか */
  isSupported: boolean;
  /** 通知を表示できるか */
  canNotify: boolean;
  /** 権限リクエスト中 */
  loading: boolean;
  /** エラー */
  error: Error | null;
}

/**
 * ローカル通知を使用するカスタムフック
 *
 * @example
 * const { notify, requestPermission, permission } = useLocalNotification();
 *
 * // 権限をリクエスト
 * await requestPermission();
 *
 * // 通知を表示
 * await notify('タイトル', { body: '本文' });
 */
export const useLocalNotification = (): UseLocalNotificationReturn => {
  const manager = LocalNotificationManager.getInstance();
  const [permission, setPermission] = useState<
    "default" | "granted" | "denied"
  >(manager.getPermissionStatus());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 権限状態を初期化
  useEffect(() => {
    const currentPermission = manager.getPermissionStatus();
    setPermission(currentPermission);
  }, [manager]);

  // 権限をリクエスト
  const requestPermission = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await manager.requestPermission();
      setPermission(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      logger.error("Failed to request notification permission:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [manager]);

  // 通知を表示
  const notify = useCallback(
    async (title: string, options?: LocalNotificationOptions) => {
      try {
        setError(null);
        return await manager.showNotification(title, options);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        logger.error("Failed to show notification:", error);
        throw error;
      }
    },
    [manager],
  );

  return {
    notify,
    requestPermission,
    permission,
    isSupported: manager.isSupported(),
    canNotify: manager.canShowNotifications(),
    loading,
    error,
  };
};
