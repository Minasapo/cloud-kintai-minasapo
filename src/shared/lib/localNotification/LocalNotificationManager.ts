import { createLogger } from "@shared/lib/logger";

import {
  AttendanceNotificationType,
  LocalNotificationError,
  LocalNotificationOptions,
  NotificationNotSupportedError,
  NotificationPermissionError,
  NotificationPermissionStatus,
  NotificationTypeMetadata,
  WorkflowNotificationType,
} from "./types";

const logger = createLogger("LocalNotificationManager");

/**
 * ローカル通知を管理するマネージャークラス
 */
export class LocalNotificationManager {
  private static instance: LocalNotificationManager | null = null;
  private notificationQueue: Map<string, Notification> = new Map();
  private readonly maxQueueSize = 10;

  /**
   * シングルトンインスタンスを取得
   */
  static getInstance(): LocalNotificationManager {
    if (!LocalNotificationManager.instance) {
      LocalNotificationManager.instance = new LocalNotificationManager();
    }
    return LocalNotificationManager.instance;
  }

  /**
   * Notification API がサポートされているか確認
   */
  isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
  }

  /**
   * 通知の権限状態を取得
   */
  getPermissionStatus(): NotificationPermissionStatus {
    if (!this.isSupported()) {
      return "denied";
    }
    return Notification.permission as NotificationPermissionStatus;
  }

  /**
   * 通知の権限をリクエスト
   */
  async requestPermission(): Promise<NotificationPermissionStatus> {
    if (!this.isSupported()) {
      throw new NotificationNotSupportedError();
    }

    try {
      const permission = await Notification.requestPermission();
      logger.info("Notification permission requested:", permission);
      return permission as NotificationPermissionStatus;
    } catch (error) {
      logger.error("Failed to request notification permission:", error);
      throw new LocalNotificationError(
        "Failed to request notification permission",
        "REQUEST_FAILED",
      );
    }
  }

  /**
   * 通知を表示できるかどうかを確認
   */
  canShowNotifications(): boolean {
    return this.isSupported() && this.getPermissionStatus() === "granted";
  }

  /**
   * 通知を表示
   */
  async showNotification(
    title: string,
    options?: LocalNotificationOptions,
  ): Promise<Notification | null> {
    if (!this.isSupported()) {
      logger.warn("Notification API is not supported");
      return null;
    }

    if (!this.canShowNotifications()) {
      logger.warn("Notification permission not granted");
      throw new NotificationPermissionError();
    }

    if (this.notificationQueue.size >= this.maxQueueSize) {
      logger.warn("Notification queue is full, removing oldest notification");
      const firstKey = this.notificationQueue.keys().next().value as
        | string
        | undefined;
      if (firstKey) {
        const notification = this.notificationQueue.get(firstKey);
        if (notification) {
          notification.close();
          this.notificationQueue.delete(firstKey);
        }
      }
    }

    try {
      const mode = options?.mode ?? "auto-close";
      const notificationOptions: NotificationOptions = {
        silent: false, // デフォルトで音を鳴らす
        ...options,
        // mode が 'await-interaction' の場合は requireInteraction を強制する
        requireInteraction:
          mode === "await-interaction" ? true : options?.requireInteraction,
      };

      // Service Worker がない場合はダイレクトに表示
      // Note: Service Worker を使用する場合は、通知の管理方法が異なるため、
      // ここでは常に Notification API を直接使用します
      const notification = new Notification(title, notificationOptions);

      // コールバック登録
      this.attachEventListeners(notification, options);

      // キューに登録
      const tag = options?.tag || `notification-${Date.now()}`;
      this.notificationQueue.set(tag, notification);

      // auto-close モードの場合は5秒後に自動削除
      if (mode === "auto-close") {
        setTimeout(() => {
          notification.close();
          this.notificationQueue.delete(tag);
        }, 5000);
      }

      logger.info("Notification shown:", { title, tag, mode });
      options?.onShow?.(notification);

      return notification;
    } catch (error) {
      logger.error("Failed to show notification:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      options?.onError?.(new Error(errorMessage));
      throw new LocalNotificationError(
        "Failed to show notification",
        "SHOW_FAILED",
      );
    }
  }

  /**
   * イベントリスナーをアタッチ
   */
  private attachEventListeners(
    notification: Notification,
    options?: LocalNotificationOptions,
  ): void {
    if (options?.onClick) {
      notification.addEventListener("click", (event) => {
        options.onClick?.(notification, event);
        notification.close();
      });
    }

    if (options?.onClose) {
      notification.addEventListener("close", () => {
        options.onClose?.(notification);
      });
    }

    // エラーハンドリング
    notification.addEventListener("error", () => {
      const error = new LocalNotificationError(
        "Notification error occurred",
        "NOTIFICATION_ERROR",
      );
      options?.onError?.(error);
    });
  }

  /**
   * 勤怠関連の通知を表示（ヘルパーメソッド）
   */
  async showAttendanceNotification(
    type: AttendanceNotificationType,
    data: Record<string, string | number>,
  ): Promise<Notification | null> {
    const metadata = this.getAttendanceNotificationMetadata(type, data);
    return this.showNotification(metadata.title, {
      body: metadata.body,
      icon: metadata.icon,
      badge: metadata.badge,
      tag: type,
      mode: metadata.mode,
      priority: metadata.priority,
      requireInteraction: metadata.requireInteraction,
      silent: false, // 通知音を鳴らす
    });
  }

  /**
   * 勤怠通知のメタデータを取得
   */
  private getAttendanceNotificationMetadata(
    type: AttendanceNotificationType,
    data: Record<string, string | number>,
  ): NotificationTypeMetadata & { body?: string } {
    const baseMetadata: NotificationTypeMetadata & { body?: string } = {
      title: "",
      icon: "✓",
      badge: "✓",
      mode: "await-interaction",
      priority: "normal",
    };

    switch (type) {
      case AttendanceNotificationType.CLOCK_IN_SUCCESS:
        return {
          ...baseMetadata,
          title: "出勤打刻完了",
          body: `${data.time} に出勤打刻しました`,
          mode: "await-interaction",
          priority: "normal",
        };

      case AttendanceNotificationType.CLOCK_OUT_SUCCESS:
        return {
          ...baseMetadata,
          title: "退勤打刻完了",
          body: `${data.time} に退勤打刻しました`,
          mode: "await-interaction",
          priority: "normal",
        };

      case AttendanceNotificationType.BREAK_START_SUCCESS:
        return {
          ...baseMetadata,
          title: "休憩開始",
          body: `${data.time} に休憩を開始しました`,
          mode: "await-interaction",
          priority: "normal",
        };

      case AttendanceNotificationType.BREAK_END_SUCCESS:
        return {
          ...baseMetadata,
          title: "休憩終了",
          body: `${data.time} に休憩を終了しました`,
          mode: "await-interaction",
          priority: "normal",
        };

      case AttendanceNotificationType.CLOCK_IN_ERROR:
      case AttendanceNotificationType.CLOCK_OUT_ERROR:
        return {
          ...baseMetadata,
          title: "打刻失敗",
          body: `${data.error || "ネットワークエラーが発生しました"}`,
          mode: "await-interaction",
          priority: "high",
          icon: "⚠️",
          badge: "⚠️",
        };

      case AttendanceNotificationType.DAILY_REPORT_SUBMITTED:
        return {
          ...baseMetadata,
          title: "日報を提出しました",
          body: `${data.date} の日報を提出しました`,
          mode: "await-interaction",
          priority: "normal",
        };

      case AttendanceNotificationType.DAILY_REPORT_REMINDER:
        return {
          ...baseMetadata,
          title: "日報の提出を忘れていませんか？",
          body: `${data.date} の日報をまだ提出していません`,
          mode: "await-interaction",
          priority: "normal",
        };

      case AttendanceNotificationType.ATTENDANCE_CHANGE_REQUEST_APPROVED:
        return {
          ...baseMetadata,
          title: "勤怠情報の変更リクエストを承認しました",
          body: `${data.date} の勤怠情報の変更リクエストが承認されました`,
          mode: "await-interaction",
          priority: "high",
          icon: "✅",
          badge: "✅",
        };

      default:
        return baseMetadata;
    }
  }

  /**
   * ワークフロー関連の通知を表示（ヘルパーメソッド）
   */
  async showWorkflowNotification(
    type: WorkflowNotificationType,
    data: Record<string, string | number>,
  ): Promise<Notification | null> {
    const metadata = this.getWorkflowNotificationMetadata(type, data);

    return this.showNotification(metadata.title, {
      body: metadata.body,
      icon: metadata.icon,
      badge: metadata.badge,
      tag: type,
      mode: metadata.mode,
      priority: metadata.priority,
      requireInteraction: metadata.requireInteraction,
      silent: false,
    });
  }

  /**
   * ワークフロー通知のメタデータを取得
   */
  private getWorkflowNotificationMetadata(
    type: WorkflowNotificationType,
    data: Record<string, string | number>,
  ): NotificationTypeMetadata & { body?: string } {
    const baseMetadata: NotificationTypeMetadata & { body?: string } = {
      title: "",
      icon: "📋",
      badge: "📋",
      mode: "await-interaction",
      priority: "normal",
    };

    switch (type) {
      case WorkflowNotificationType.WORKFLOW_CREATED:
        return {
          ...baseMetadata,
          title: "新しい申請があります",
          body: data.submitterName
            ? `${data.submitterName} さんから${data.categoryLabel || "申請"}が作成されました`
            : `新しい${data.categoryLabel || "申請"}が作成されました`,
          mode: "await-interaction",
          priority: "high",
          requireInteraction: true,
        };

      case WorkflowNotificationType.WORKFLOW_APPROVED:
        return {
          ...baseMetadata,
          title: "申請が承認されました",
          body: data.approverName
            ? `${data.approverName} さんが申請を承認しました`
            : "申請が承認されました",
          mode: "await-interaction",
          priority: "high",
          icon: "✅",
          badge: "✅",
          requireInteraction: true,
        };

      case WorkflowNotificationType.WORKFLOW_REJECTED:
        return {
          ...baseMetadata,
          title: "申請が却下されました",
          body: data.approverName
            ? `${data.approverName} さんが申請を却下しました`
            : "申請が却下されました",
          mode: "await-interaction",
          priority: "high",
          icon: "❌",
          badge: "❌",
        };

      case WorkflowNotificationType.WORKFLOW_UPDATED:
        return {
          ...baseMetadata,
          title: "申請が更新されました",
          body: `${data.categoryLabel || "申請"}が更新されました`,
          mode: "await-interaction",
          priority: "normal",
          requireInteraction: true,
        };

      default:
        return baseMetadata;
    }
  }

  /**
   * すべての通知を閉じる
   */
  closeAllNotifications(): void {
    this.notificationQueue.forEach((notification) => {
      notification.close();
    });
    this.notificationQueue.clear();
    logger.info("All notifications closed");
  }

  /**
   * 特定のタグの通知を閉じる
   */
  closeNotificationByTag(tag: string): void {
    const notification = this.notificationQueue.get(tag);
    if (notification) {
      notification.close();
      this.notificationQueue.delete(tag);
      logger.info("Notification closed:", { tag });
    }
  }

  /**
   * キューのサイズを取得
   */
  getQueueSize(): number {
    return this.notificationQueue.size;
  }

  /**
   * キューをクリア
   */
  clearQueue(): void {
    this.notificationQueue.clear();
  }
}
