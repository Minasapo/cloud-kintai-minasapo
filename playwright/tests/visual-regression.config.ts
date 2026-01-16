/**
 * ビジュアルリグレッションテスト設定
 *
 * このファイルは、ビジュアルテストに関する設定値や
 * テスト対象ページの定義を一元管理します。
 */

/**
 * スクリーンショット比較のデフォルト設定
 */
export const SCREENSHOT_DEFAULTS = {
  // フルページスクリーンショット時の許容差異ピクセル数
  fullPageMaxDiffPixels: 100,

  // ビューポート（見える範囲）のみのスクリーンショット時の許容差異
  viewportMaxDiffPixels: 50,

  // コンポーネント単位でのスクリーンショット時の許容差異
  componentMaxDiffPixels: 30,

  // 色差異の許容レベル（0-1, デフォルト: 0.2）
  threshold: 0.2,
};

/**
 * ページロード待機設定
 */
export const LOADING_DEFAULTS = {
  // ネットワークの読み込み完了を待つまでの最大時間（ミリ秒）
  networkIdleTimeout: 5000,

  // アニメーション完了を待つ最大時間
  animationTimeout: 3000,

  // スクロール完了後の待機時間
  scrollWaitTime: 300,

  // モーダル/ダイアログ表示後の待機時間
  modalWaitTime: 500,
};

/**
 * ビューポートプリセット定義
 * iPhone 12 Proとデスクトップ
 */
export const VIEWPORT_PRESETS = {
  // モバイル
  mobile: {
    width: 390,
    height: 844,
    name: "mobile",
    label: "Mobile (iPhone 12 Pro)",
  },

  // デスクトップ
  desktop: {
    width: 1440,
    height: 900,
    name: "desktop",
    label: "Desktop",
  },
};

/**
 * スタッフユーザー向けテスト対象ページ
 * router.tsx をベースに定義
 */
export const STAFF_TEST_PAGES = [
  // 勤怠管理
  {
    path: "/attendance/list",
    name: "勤怠一覧",
    category: "勤怠管理",
    description: "従業員の勤怠情報一覧ページ",
  },
  {
    path: "/attendance/stats",
    name: "勤怠統計",
    category: "勤怠管理",
    description: "勤怠統計情報ページ",
  },
  {
    path: "/attendance/report",
    name: "日報",
    category: "勤怠管理",
    description: "日報提出ページ",
  },
  {
    path: "/register",
    name: "勤怠打刻",
    category: "勤怠管理",
    description: "打刻入力ページ",
  },

  // ワークフロー
  {
    path: "/workflow",
    name: "ワークフロー一覧",
    category: "ワークフロー",
    description: "申請・承認ワークフロー一覧",
  },

  // シフト
  {
    path: "/shift",
    name: "シフト申請",
    category: "シフト管理",
    description: "シフト申請ページ",
  },

  // オフィス
  {
    path: "/office",
    name: "オフィスホーム",
    category: "オフィス",
    description: "オフィス関連機能ホームページ",
  },
  {
    path: "/office/qr",
    name: "オフィスQR",
    category: "オフィス",
    description: "QRコード操作ページ",
  },
  {
    path: "/office/qr/register",
    name: "オフィスQR登録",
    category: "オフィス",
    description: "QRコード登録ページ",
  },

  // アカウント
  {
    path: "/profile",
    name: "プロフィール",
    category: "アカウント",
    description: "ユーザープロフィール編集ページ",
  },
];

/**
 * 管理者ユーザー向けテスト対象ページ
 * adminChildRoutes.tsx をベースに定義
 */
export const ADMIN_TEST_PAGES = [
  // ダッシュボード
  {
    path: "/admin",
    name: "管理画面ダッシュボード",
    category: "ダッシュボード",
    description: "管理画面のメインダッシュボード",
  },

  // スタッフ管理
  {
    path: "/admin/staff",
    name: "スタッフ管理",
    category: "ユーザー管理",
    description: "スタッフユーザーの管理ページ",
  },

  // 勤怠管理
  {
    path: "/admin/attendances",
    name: "勤怠管理",
    category: "勤怠管理",
    description: "全スタッフの勤怠管理ページ",
  },

  // シフト管理
  {
    path: "/admin/shift",
    name: "シフト管理",
    category: "シフト管理",
    description: "シフト情報管理ページ",
  },
  {
    path: "/admin/shift-plan",
    name: "シフトプラン管理",
    category: "シフト管理",
    description: "シフトプラン作成・管理ページ",
  },

  // マスタ管理
  {
    path: "/admin/master/job_term",
    name: "職位管理",
    category: "マスタ管理",
    description: "職位マスタの管理ページ",
  },
  {
    path: "/admin/master/holiday_calendar",
    name: "祝日カレンダー",
    category: "マスタ管理",
    description: "祝日カレンダー設定ページ",
  },
  {
    path: "/admin/master/theme",
    name: "テーマ管理",
    category: "マスタ管理",
    description: "アプリケーションテーマ設定ページ",
  },
  {
    path: "/admin/master/shift",
    name: "シフト設定",
    category: "マスタ管理",
    description: "シフト関連設定ページ",
  },
  {
    path: "/admin/master/feature_management",
    name: "機能管理",
    category: "マスタ管理",
    description: "機能管理・設定ページ",
  },

  // ワークフロー管理
  {
    path: "/admin/workflow",
    name: "ワークフロー管理",
    category: "ワークフロー",
    description: "ワークフロー定義・管理ページ",
  },

  // ログ管理
  {
    path: "/admin/logs",
    name: "操作ログ",
    category: "ログ管理",
    description: "システム操作ログ確認ページ",
  },

  // 日報管理
  {
    path: "/admin/daily-report",
    name: "日報管理",
    category: "報告管理",
    description: "日報の管理・確認ページ",
  },
];

/**
 * コンポーネントテスト対象
 */
export const COMPONENT_TEST_TARGETS = {
  // ナビゲーション関連
  navigation: {
    selectors: ["header", "nav", "[role='banner']", "[role='navigation']"],
    name: "ナビゲーション",
  },

  // フォーム関連
  forms: {
    selectors: ["form", "[role='form']"],
    name: "フォーム",
  },

  // テーブル関連
  tables: {
    selectors: ["table", "[role='table']", "[role='grid']"],
    name: "テーブル",
  },

  // モーダル/ダイアログ
  modals: {
    selectors: ["[role='dialog']", ".modal", ".dialog", "[class*='Modal']"],
    name: "モーダル",
  },

  // ボタン
  buttons: {
    selectors: ["button"],
    name: "ボタン",
  },

  // アラート/通知
  alerts: {
    selectors: ["[role='alert']", ".alert", "[class*='Alert']"],
    name: "アラート",
  },
};

/**
 * テスト用の様々なユーザーアクション
 */
export const USER_ACTIONS = {
  hover: "マウスホバー",
  focus: "フォーカス",
  click: "クリック",
  input: "入力",
  check: "チェック",
  select: "選択",
};

/**
 * ビジュアルテスト実行時のスクリーンショット保存オプション
 */
export const SCREENSHOT_SAVE_OPTIONS = {
  // スクリーンショット保存ディレクトリ
  directory: "playwright/tests/screenshots",

  // スナップショット保存ディレクトリ
  snapshotDirectory: "playwright/tests/__snapshots__",

  // ファイル命名規則（テンプレート）
  fileNameTemplate: {
    fullPage: "{user}-{path}-{viewport}-full",
    viewport: "{user}-{path}-{viewport}-viewport",
    component: "{user}-{component}-{state}",
    responsive: "responsive-{page}-{viewport}",
  },
};

/**
 * キーボードショートカット（テスト用）
 */
export const KEYBOARD_SHORTCUTS = {
  escape: "Escape",
  enter: "Enter",
  tab: "Tab",
  space: " ",
  arrowUp: "ArrowUp",
  arrowDown: "ArrowDown",
};

/**
 * テストタイムアウト設定
 */
export const TEST_TIMEOUTS = {
  // ページナビゲーション
  navigation: 10000,

  // 要素待機
  elementWait: 5000,

  // スクリーンショット取得
  screenshot: 10000,

  // 全テスト（デフォルト）
  test: 30000,
};

/**
 * 比較オプションの変更戦略
 */
export const COMPARISON_STRATEGIES = {
  // 厳格な比較（デザイン系ページ）
  strict: {
    maxDiffPixels: 30,
    threshold: 0.15,
  },

  // 標準的な比較
  normal: {
    maxDiffPixels: 75,
    threshold: 0.2,
  },

  // 緩い比較（複雑なデータテーブル等）
  loose: {
    maxDiffPixels: 150,
    threshold: 0.3,
  },

  // 非常に緩い比較（リアルタイム更新コンテンツ）
  veryLoose: {
    maxDiffPixels: 300,
    threshold: 0.4,
  },
};

/**
 * CSS セレクタの共通パターン
 */
export const CSS_SELECTORS = {
  mainContent:
    "main, [role='main'], [class*='MainContent'], [class*='Container']",
  sidebar:
    "aside, [role='navigation'], [class*='Sidebar'], [class*='Navigation']",
  header: "header, [role='banner'], [class*='Header'], [class*='TopBar']",
  footer: "footer, [role='contentinfo'], [class*='Footer']",
  modal: "[role='dialog'], .modal, [class*='Modal'], [class*='Dialog']",
  button: "button, [role='button'], a[class*='Button']",
  input: "input, textarea, select",
  error: "[role='alert'], [class*='Error'], .error-message",
  success: "[class*='Success'], [class*='Success'], .success-message",
  loading: "[class*='Loading'], [class*='Spinner'], .spinner",
};

/**
 * ビジュアルテスト実行モード
 */
export enum VisualTestMode {
  // ベースラインスクリーンショットの作成（初回実行時）
  BASELINE = "baseline",

  // 通常のテスト実行（ベースラインとの比較）
  COMPARE = "compare",

  // スクリーンショットの更新
  UPDATE = "update",

  // デバッグモード（ファイル保存）
  DEBUG = "debug",
}

/**
 * テスト結果の集計用
 */
export interface VisualTestResult {
  testName: string;
  pagePath: string;
  status: "passed" | "failed" | "skipped";
  diffPixels?: number;
  viewport?: { width: number; height: number };
  timestamp: number;
  message?: string;
}

/**
 * エクスポート用の集約オブジェクト
 */
export const VISUAL_TEST_CONFIG = {
  SCREENSHOT_DEFAULTS,
  LOADING_DEFAULTS,
  VIEWPORT_PRESETS,
  STAFF_TEST_PAGES,
  ADMIN_TEST_PAGES,
  COMPONENT_TEST_TARGETS,
  USER_ACTIONS,
  SCREENSHOT_SAVE_OPTIONS,
  KEYBOARD_SHORTCUTS,
  TEST_TIMEOUTS,
  COMPARISON_STRATEGIES,
  CSS_SELECTORS,
  VisualTestMode,
};
