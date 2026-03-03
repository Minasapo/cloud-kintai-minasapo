/**
 * ローカル通知管理のための型定義
 */

/**
 * 通知權限の状態
 */
export type NotificationPermissionStatus = "default" | "granted" | "denied";

/**
 * 通知モード
 * - auto-close: 自動クローズ型（出勤打刻などユーザー自身への操作確認通知）
 * - await-interaction: 相手待ち型（勤怠修正申請などの相手への通知）
 */
export type NotificationMode = "auto-close" | "await-interaction";

/**
 * 通知の優先度
 */
export type NotificationPriority = "high" | "normal" | "low";

/**
 * 通知オプション
 */
export interface LocalNotificationOptions extends NotificationOptions {
  /** 「イッ一意のタグ（重複排除用） */
  tag?: string;
  /** 通知モード（デフォルト: auto-close） */
  mode?: NotificationMode;
  /** 通知の優先度（デフォルト: normal） */
  priority?: NotificationPriority;
  /** ユーザーインタラクション時のコールバック */
  onShow?: (notification: Notification) => void;
  /** 通知クリック時のコールバック */
  onClick?: (notification: Notification, event: Event) => void;
  /** 通知を閉じたときのコールバック */
  onClose?: (notification: Notification) => void;
  /** エラー発生時のコールバック */
  onError?: (error: Error) => void;
}

/**
 * 勤怠関連の通知タイプ
 */
export enum AttendanceNotificationType {
  CLOCK_IN_SUCCESS = "clock_in_success",
  CLOCK_OUT_SUCCESS = "clock_out_success",
  BREAK_START_SUCCESS = "break_start_success",
  BREAK_END_SUCCESS = "break_end_success",
  CLOCK_IN_ERROR = "clock_in_error",
  CLOCK_OUT_ERROR = "clock_out_error",
  DAILY_REPORT_SUBMITTED = "daily_report_submitted",
  DAILY_REPORT_REMINDER = "daily_report_reminder",
}

/**
 * 通知タイプのメタデータ
 */
export interface NotificationTypeMetadata {
  title: string;
  requireInteraction?: boolean;
  icon?: string;
  badge?: string;
  mode?: NotificationMode;
  priority?: NotificationPriority;
}

/**
 * ローカル通知マネージャーのエラークラス
 */
export class LocalNotificationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "LocalNotificationError";
  }
}

/**
 * 通知権限エラー
 */
export class NotificationPermissionError extends LocalNotificationError {
  constructor(message: string = "Notification permission not granted") {
    super(message, "PERMISSION_DENIED");
    this.name = "NotificationPermissionError";
  }
}

/**
 * 通知非サポートエラー
 */
export class NotificationNotSupportedError extends LocalNotificationError {
  constructor(message: string = "Notification API is not supported") {
    super(message, "NOT_SUPPORTED");
    this.name = "NotificationNotSupportedError";
  }
}
