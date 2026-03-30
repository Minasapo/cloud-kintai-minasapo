export type AdminSettingsCategoryKey =
  | "basic"
  | "attendanceRules"
  | "operations"
  | "integration";

export type AdminSettingsCategory = {
  key: AdminSettingsCategoryKey;
  title: string;
  description: string;
  order: number;
};

export type AdminSettingsItem = {
  title: string;
  path: string;
  category: AdminSettingsCategoryKey;
  description: string;
  order: number;
  ctaLabel: string;
};

export const ADMIN_SETTINGS_CATEGORIES: readonly AdminSettingsCategory[] = [
  {
    key: "basic",
    title: "基本設定",
    description: "集計期間やカレンダー、見た目など、運用全体の土台となる設定です。",
    order: 1,
  },
  {
    key: "attendanceRules",
    title: "勤務ルール",
    description: "勤務時間、休暇区分、打刻の扱いなど、日々の勤怠ルールを管理します。",
    order: 2,
  },
  {
    key: "operations",
    title: "運用設定",
    description: "シフト運用や申請フローなど、現場オペレーションに関わる設定です。",
    order: 3,
  },
  {
    key: "integration",
    title: "外部連携・補助",
    description: "外部公開情報、補助項目、エクスポートなどの周辺設定を管理します。",
    order: 4,
  },
] as const;

export const ADMIN_SETTINGS_ITEMS: readonly AdminSettingsItem[] = [
  {
    title: "集計対象月",
    path: "/admin/master/job_term",
    category: "basic",
    description: "勤怠締め日を登録し、集計や出力で使う対象月を定義します。",
    order: 1,
    ctaLabel: "集計対象月を開く",
  },
  {
    title: "カレンダー設定",
    path: "/admin/master/holiday_calendar",
    category: "basic",
    description: "会社休日やイベント日を管理し、勤務判定の基準日を整えます。",
    order: 2,
    ctaLabel: "カレンダー設定を開く",
  },
  {
    title: "テーマ",
    path: "/admin/master/theme",
    category: "basic",
    description: "ヘッダーとフッターの配色テーマを切り替えます。",
    order: 3,
    ctaLabel: "テーマを開く",
  },
  {
    title: "勤務時間",
    path: "/admin/master/feature_management/working_time",
    category: "attendanceRules",
    description: "標準の始業・終業・休憩時間を設定します。",
    order: 1,
    ctaLabel: "勤務時間を開く",
  },
  {
    title: "午前/午後休",
    path: "/admin/master/feature_management/am_pm_holiday",
    category: "attendanceRules",
    description: "半休区分の名称や利用条件を管理します。",
    order: 2,
    ctaLabel: "午前/午後休を開く",
  },
  {
    title: "出勤モード",
    path: "/admin/master/feature_management/office_mode",
    category: "attendanceRules",
    description: "出勤打刻の運用モードや時間単位休暇の扱いを設定します。",
    order: 3,
    ctaLabel: "出勤モードを開く",
  },
  {
    title: "特別休暇",
    path: "/admin/master/feature_management/special_holiday",
    category: "attendanceRules",
    description: "特別休暇の区分と利用可否を管理します。",
    order: 4,
    ctaLabel: "特別休暇を開く",
  },
  {
    title: "欠勤",
    path: "/admin/master/feature_management/absent",
    category: "attendanceRules",
    description: "欠勤時の表示や勤怠上の扱いを設定します。",
    order: 5,
    ctaLabel: "欠勤設定を開く",
  },
  {
    title: "シフト",
    path: "/admin/master/shift",
    category: "operations",
    description: "シフトグループや表示モードなど、シフト管理の基本挙動を設定します。",
    order: 1,
    ctaLabel: "シフト設定を開く",
  },
  {
    title: "ワークフロー",
    path: "/admin/master/workflow",
    category: "operations",
    description: "申請カテゴリごとの承認フローを設定します。",
    order: 2,
    ctaLabel: "ワークフローを開く",
  },
  {
    title: "稼働統計",
    path: "/admin/master/feature_management/attendance_statistics",
    category: "operations",
    description: "稼働統計の集計表示に関する設定を管理します。",
    order: 3,
    ctaLabel: "稼働統計を開く",
  },
  {
    title: "残業確認",
    path: "/admin/master/feature_management/overtime_confirmation",
    category: "operations",
    description: "残業確認フローや表示条件を設定します。",
    order: 4,
    ctaLabel: "残業確認を開く",
  },
  {
    title: "クイック入力",
    path: "/admin/master/feature_management/quick_input",
    category: "operations",
    description: "勤怠入力時に使うクイック入力候補を整備します。",
    order: 5,
    ctaLabel: "クイック入力を開く",
  },
  {
    title: "外部リンク",
    path: "/admin/master/feature_management/links",
    category: "integration",
    description: "打刻画面などから参照する外部リンクを管理します。",
    order: 1,
    ctaLabel: "外部リンクを開く",
  },
  {
    title: "打刻理由",
    path: "/admin/master/feature_management/reasons",
    category: "integration",
    description: "打刻理由の候補を整備し、入力補助に使います。",
    order: 2,
    ctaLabel: "打刻理由を開く",
  },
  {
    title: "打刻画面アナウンス",
    path: "/admin/master/time_recorder_announcement",
    category: "integration",
    description: "打刻画面に表示するお知らせ文を設定します。",
    order: 3,
    ctaLabel: "アナウンス設定を開く",
  },
  {
    title: "エクスポート",
    path: "/admin/master/export",
    category: "integration",
    description: "外部連携向けのエクスポート設定や出力内容を確認します。",
    order: 4,
    ctaLabel: "エクスポートを開く",
  },
  {
    title: "開発者",
    path: "/admin/master/developer",
    category: "integration",
    description: "開発・検証向けの補助設定を管理します。",
    order: 5,
    ctaLabel: "開発者設定を開く",
  },
] as const;

export const ADMIN_SETTINGS_CATEGORY_MAP = new Map(
  ADMIN_SETTINGS_CATEGORIES.map((category) => [category.key, category]),
);

export function getAdminSettingsNavigationGroups() {
  return ADMIN_SETTINGS_CATEGORIES.map((category) => ({
    ...category,
    items: ADMIN_SETTINGS_ITEMS.filter((item) => item.category === category.key).toSorted(
      (a, b) => a.order - b.order,
    ),
  })).toSorted((a, b) => a.order - b.order);
}

export function findAdminSettingsItemByPath(pathname: string) {
  return ADMIN_SETTINGS_ITEMS.find((item) => pathname === item.path);
}

export function resolveAdminSettingsCategory(pathname: string) {
  const currentItem = findAdminSettingsItemByPath(pathname);

  if (!currentItem) {
    return null;
  }

  return ADMIN_SETTINGS_CATEGORY_MAP.get(currentItem.category) ?? null;
}
