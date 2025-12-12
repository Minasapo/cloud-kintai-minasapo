import { useMemo } from "react";

export interface AdminHeaderMenuItem {
  primaryLabel: string;
  secondaryLabel?: string;
  description?: string;
  ctaLabel?: string;
  href: string;
}

export type UseHeaderMenuResult = readonly AdminHeaderMenuItem[];

const useHeaderMenu = (): UseHeaderMenuResult =>
  useMemo(
    () => [
      {
        primaryLabel: "スタッフ",
        description: "スタッフ情報の登録・編集や在籍状況の確認を行います。",
        href: "/admin/staff",
      },
      {
        primaryLabel: "勤怠",
        description: "勤怠一覧や申請内容を確認し、必要に応じて修正します。",
        href: "/admin/attendances",
      },
      {
        primaryLabel: "シフト",
        description: "シフトの作成・配信やスタッフごとの調整を行います。",
        href: "/admin/shift",
      },
      {
        primaryLabel: "シフト計画",
        description: "月次・週次のシフト計画を立案し公開します。",
        href: "/admin/shift-plan",
      },
      {
        primaryLabel: "日報",
        description: "提出された日報を確認し、差し戻しや承認を実行します。",
        href: "/admin/daily-report",
      },
      {
        primaryLabel: "ワークフロー",
        description: "申請テンプレートや進行中のワークフローを管理します。",
        href: "/admin/workflow",
      },
      {
        primaryLabel: "ログ",
        description: "操作ログを検索し、監査や不備調査に活用します。",
        href: "/admin/logs",
      },
      {
        primaryLabel: "設定",
        description: "勤務時間や出勤区分などの各種マスタ設定を管理します。",
        href: "/admin/master",
      },
    ],
    []
  );

export default useHeaderMenu;
