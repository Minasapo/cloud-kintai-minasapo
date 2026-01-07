/**
 * @file uiDimensions.ts
 * @description UI コンポーネントの幅、高さ、パディング などの寸法定義
 */

/** ボタンの最小幅（ピクセル） */
export const BUTTON_MIN_WIDTH = 160;

/** テーブル/フォームのセレクターの最小幅（ピクセル） */
export const SELECTOR_MIN_WIDTH = 300;

/** テーブル/フォームのセレクターの最大幅（ピクセル） */
export const SELECTOR_MAX_WIDTH = 500;

/** ドロップダウンメニューの最大幅（ピクセル） */
export const DROPDOWN_MAX_WIDTH = 500;

/** カード/パネルのボーダー幅（CSSで使用） */
export const CARD_BORDER_WIDTH = 1;

/** 標準的なパディング値（MUIの sp ユーティリティで使用） */
export const STANDARD_PADDING = {
  /** カード内の標準パディング */
  CARD: 3,
  /** 行内の小さいパディング */
  SMALL: 1,
} as const;

/** リスト項目の幅設定（MUI sx prop で使用） */
export const LIST_WIDTHS = {
  /** フルウィドス */
  FULL: 1,
  /** 半分の幅 */
  HALF: 0.5,
} as const;

/** パネル/モーダルの高さ設定（ピクセル） */
export const PANEL_HEIGHTS = {
  /** スクロール可能なパネルの最大高さ */
  SCROLLABLE_MAX: 480,
  /** ダッシュボード内のパネル最小高さ */
  DASHBOARD_MIN: 480,
  /** 統計パネルの最小高さ */
  STATISTICS_MIN: 480,
  /** デスクトップカレンダーの最小高さ */
  CALENDAR_MIN: 140,
  /** テキストエリアの最小高さ */
  TEXTAREA_MIN: 48,
  /** フォーム項目の最小高さ */
  FORM_ITEM_MIN: 52,
} as const;

/** マージン設定（MUI sx prop で使用） */
export const MARGINS = {
  /** チェックボックスアイコンのマージン */
  CHECKBOX_MARGIN: 8,
  /** フォーム項目の上下マージン */
  FORM_MARGIN: 2,
  /** 右側マージン（フォーム要素） */
  RIGHT_FORM: 3,
  /** 標準パディング値 */
  PADDING_STANDARD: 8,
} as const;
