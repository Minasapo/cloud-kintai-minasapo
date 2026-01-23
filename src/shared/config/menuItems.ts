/**
 * メニュー項目の定数定義
 * ユーザーロールに応じて表示されるメニュー項目を管理します。
 */

export interface MenuItem {
  label: string;
  href: string;
}

/**
 * 一般ユーザー向けメニュー項目
 */
export const GENERAL_MENU_ITEMS: readonly MenuItem[] = [
  { label: "勤怠打刻", href: "/register" },
  { label: "勤怠一覧", href: "/attendance/list" },
  { label: "日報", href: "/attendance/report" },
  // { label: "ドキュメント", href: "/docs" }, // コメントアウト済み
] as const;

/**
 * 管理者向けメニュー項目
 */
export const ADMIN_MENU_ITEMS: readonly MenuItem[] = [
  { label: "勤怠管理", href: "/admin/attendances" },
  { label: "スタッフ管理", href: "/admin/staff" },
  { label: "設定", href: "/admin/master" },
] as const;

/**
 * オペレーター向けメニュー項目（オフィスモード有効時）
 */
export const OPERATOR_MENU_ITEMS: readonly MenuItem[] = [
  { label: "QR表示", href: "/office/qr" },
] as const;
