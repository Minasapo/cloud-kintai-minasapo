/**
 * @file timeouts.ts
 * @description アプリケーション内で使用されるタイムアウト値と遅延時間の定義
 */

/** スナックバーの自動非表示時間（ミリ秒） */
export const SNACKBAR_AUTO_HIDE_DURATION = {
  /** エラーメッセージの表示時間 */
  ERROR: 6000,
  /** 成功メッセージの表示時間 */
  SUCCESS: 5000,
} as const;

/** ナビゲーション後の遅延時間（ミリ秒） */
export const NAVIGATION_DELAY = 1000;

/** API リクエストのタイムアウト時間（ミリ秒） */
export const API_REQUEST_TIMEOUT = 30000;
