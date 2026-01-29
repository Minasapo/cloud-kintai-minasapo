/**
 * @file businessLogic.ts
 * @description ビジネスロジックで使用される定数値の定義
 */

/** フラグ値 */
export const FLAG_VALUES = {
  /** 有効/True を表す値 */
  TRUE: 1,
  /** 無効/False を表す値 */
  FALSE: 0,
} as const;

/** 初期ステップの順序 */
export const INITIAL_STEP_ORDER = 0;

/** 最小限の要素数（空でない判定） */
export const MIN_ELEMENTS_COUNT = 0;

/** 過去の勤怠エラーの経過日数閾値（日） */
export const ELAPSED_ERROR_THRESHOLD_DAYS = 7;

/** 休憩時間に許容される不一致の最大数 */
export const MAX_REST_MISMATCH_COUNT = 2;
