/**
 * 管理者設定ページの定数定義
 */

/**
 * 時刻フォーマット文字列
 */
export const TIME_FORMAT = "HH:mm" as const;

/**
 * 時刻文字列の型（HH:mm形式）
 */
export type TimeString = `${string}:${string}`;

/**
 * デフォルトの時刻設定（午前半休）
 */
export const DEFAULT_AM_HOLIDAY_START: TimeString = "09:00" as const;
export const DEFAULT_AM_HOLIDAY_END: TimeString = "12:00" as const;

/**
 * デフォルトの時刻設定（午後半休）
 */
export const DEFAULT_PM_HOLIDAY_START: TimeString = "13:00" as const;
export const DEFAULT_PM_HOLIDAY_END: TimeString = "18:00" as const;

/**
 * デフォルトの勤務時間設定
 */
export const DEFAULT_WORK_START_TIME = DEFAULT_AM_HOLIDAY_START;
export const DEFAULT_WORK_END_TIME = DEFAULT_PM_HOLIDAY_END;

/**
 * デフォルトの昼休憩時間
 */
export const DEFAULT_LUNCH_START: TimeString = "12:00" as const;
export const DEFAULT_LUNCH_END: TimeString = "13:00" as const;

/**
 * 設定名（固定値）
 */
export const DEFAULT_CONFIG_NAME = "default" as const;
