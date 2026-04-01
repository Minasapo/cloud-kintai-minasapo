import { useMemo } from "react";

export interface AdminHeaderMenuItem {
  primaryLabel: string;
  secondaryLabel?: string;
  description?: string;
  ctaLabel?: string;
  href: string;
}

export type UseHeaderMenuResult = readonly AdminHeaderMenuItem[];

export const ADMIN_HEADER_MENU_ITEMS: readonly AdminHeaderMenuItem[] = [
  {
    primaryLabel: "ダッシュボード",
    secondaryLabel: "Overview",
    description: "全体状況と優先タスクを俯瞰するコントロールデッキです。",
    ctaLabel: "主要KPIを確認",
    href: "/admin",
  },
  {
    primaryLabel: "勤怠",
    secondaryLabel: "Attendance",
    description: "勤怠一覧・修正申請・個別編集を統合して管理します。",
    ctaLabel: "未承認申請を確認",
    href: "/admin/attendances",
  },
  {
    primaryLabel: "スタッフ",
    secondaryLabel: "People",
    description: "在籍情報・属性・勤務形態を横断して管理します。",
    ctaLabel: "スタッフ情報を更新",
    href: "/admin/staff",
  },
  {
    primaryLabel: "シフト",
    secondaryLabel: "Operations",
    description: "日次運用のシフト編集と調整を実行します。",
    ctaLabel: "当日シフトを調整",
    href: "/admin/shift",
  },
  {
    primaryLabel: "シフト計画",
    secondaryLabel: "Planning",
    description: "月次・週次の人員計画を策定して公開します。",
    ctaLabel: "計画を更新",
    href: "/admin/shift-plan",
  },
  {
    primaryLabel: "日報",
    secondaryLabel: "Reports",
    description: "提出日報の確認、差し戻し、承認を管理します。",
    ctaLabel: "未確認日報を確認",
    href: "/admin/daily-report",
  },
  {
    primaryLabel: "ワークフロー",
    secondaryLabel: "Workflow",
    description: "申請フローの進行管理とテンプレート整備を行います。",
    ctaLabel: "保留申請を処理",
    href: "/admin/workflow",
  },
  {
    primaryLabel: "ログ",
    secondaryLabel: "Audit",
    description: "操作ログの監査・検索・異常調査を行います。",
    ctaLabel: "監査ログを確認",
    href: "/admin/logs",
  },
  {
    primaryLabel: "設定",
    secondaryLabel: "Settings",
    description: "業務ルールやマスタ設定を横断的に管理します。",
    ctaLabel: "マスタ設定を開く",
    href: "/admin/master",
  },
] as const;

const useHeaderMenu = (): UseHeaderMenuResult =>
  useMemo(() => ADMIN_HEADER_MENU_ITEMS, []);

export default useHeaderMenu;
