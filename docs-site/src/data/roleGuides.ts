export type GuideLink = {
  label: string;
  docId: string;
};

export type GuideSection = {
  title: string;
  links: GuideLink[];
};

export type RelatedGuide = {
  prefix: string;
  link: GuideLink;
  suffix?: string;
};

export type GuidePageContent = {
  intro: string;
  relatedGuide?: RelatedGuide;
  sections: GuideSection[];
};

export type RoleGuideDefinition = {
  sidebar: {
    label: string;
    overviewDocId: string;
    navigationDocId: string;
    faqDocId: string;
    useCasesLabel: string;
    featuresLabel: string;
  };
  overview: GuidePageContent;
  useCases: GuidePageContent;
  features: GuidePageContent;
};

function docLink(docId: string, label: string): GuideLink {
  return {
    label,
    docId,
  };
}

export function toDocPath(docId: string): string {
  return `/docs/${docId}`;
}

function uniqueDocIds(sections: GuideSection[]): string[] {
  return [...new Set(sections.flatMap(({ links }) => links.map(({ docId }) => docId)))];
}

export const staffGuide: RoleGuideDefinition = {
  sidebar: {
    label: "スタッフ向けガイド",
    overviewDocId: "staff/overview",
    navigationDocId: "staff/navigation-map",
    faqDocId: "staff/faq",
    useCasesLabel: "ユースケース別",
    featuresLabel: "機能別",
  },
  overview: {
    intro:
      "このセクションは、日々の勤怠作業を行うスタッフ向けのガイドです。",
    sections: [
      {
        title: "探し方は 2 通りあります",
        links: [
          docLink("staff/use-cases", "目的から探す: ユースケース別ガイド"),
          docLink("staff/features", "機能や画面から探す: 機能別ガイド"),
        ],
      },
      {
        title: "このガイドでできること",
        links: [
          docLink("staff/time-recording", "出勤、休憩、退勤の打刻"),
          docLink("staff/attendance-edit", "勤怠の確認と修正申請"),
          docLink("staff/attendance-report", "日報、ワークフロー申請の提出と進捗確認"),
        ],
      },
      {
        title: "まずはこの順で確認",
        links: [
          docLink("staff/basic-operations", "基本操作"),
          docLink("work-type-overview", "勤務形態の見方"),
          docLink("staff/time-recording", "出退勤を打刻する"),
          docLink("staff/attendance-check", "勤怠を確認する"),
          docLink("staff/attendance-edit", "勤怠を修正する"),
          docLink("staff/profile-settings", "個人設定を管理する"),
          docLink("staff/request-check", "申請を確認する"),
        ],
      },
      {
        title: "よく使うページ",
        links: [
          docLink("screen-list", "画面一覧"),
          docLink("staff/navigation-map", "画面遷移マップ"),
          docLink("staff/use-cases", "ユースケース別ガイド"),
          docLink("staff/features", "機能別ガイド"),
          docLink("staff/dashboard", "打刻ダッシュボードを確認する"),
          docLink("staff/attendance-statistics", "稼働統計を確認する"),
          docLink("work-type-overview", "勤務形態の見方"),
          docLink("staff/shift", "シフトを確認・編集する"),
          docLink("staff/attendance-report", "日報を記録する"),
          docLink("staff/profile-settings", "個人設定を管理する"),
          docLink("staff/workflow", "ワークフロー申請を操作する"),
          docLink("staff/faq", "よくある質問"),
        ],
      },
    ],
  },
  useCases: {
    intro:
      "スタッフ向けドキュメントを、やりたいことから探すための入口です。",
    relatedGuide: {
      prefix: "機能名や画面名から探したい場合は、",
      link: docLink("staff/features", "機能別ガイド"),
      suffix: "を参照してください。",
    },
    sections: [
      {
        title: "はじめて使う",
        links: [
          docLink("staff/basic-operations", "基本操作"),
          docLink("work-type-overview", "勤務形態の見方"),
          docLink("staff/navigation-map", "画面遷移マップ（スタッフ向け）"),
        ],
      },
      {
        title: "出退勤と休憩を記録したい",
        links: [
          docLink("staff/time-recording", "出退勤を打刻する"),
          docLink("staff/break-time-guide", "休憩時間を正しく記録する"),
          docLink("staff/dashboard", "打刻ダッシュボードを確認する"),
        ],
      },
      {
        title: "勤怠を確認して修正したい",
        links: [
          docLink("staff/attendance-check", "勤怠を確認する"),
          docLink("staff/attendance-edit", "勤怠を修正する"),
          docLink("staff/attendance-statistics", "稼働統計を確認する"),
          docLink("staff/request-check", "申請を確認する"),
        ],
      },
      {
        title: "提出や申請を進めたい",
        links: [
          docLink("staff/attendance-report", "日報を記録する"),
          docLink("staff/workflow", "ワークフロー申請を操作する"),
          docLink("staff/request-check", "申請を確認する"),
        ],
      },
      {
        title: "補足設定を見直したい",
        links: [
          docLink("staff/profile-settings", "個人設定を管理する"),
          docLink("staff/shift", "シフトを確認・編集する"),
          docLink("staff/faq", "よくある質問"),
        ],
      },
    ],
  },
  features: {
    intro:
      "スタッフ向けドキュメントを、機能や画面から探すための入口です。",
    relatedGuide: {
      prefix: "目的や業務フローから探したい場合は、",
      link: docLink("staff/use-cases", "ユースケース別ガイド"),
      suffix: "を参照してください。",
    },
    sections: [
      {
        title: "打刻と勤怠確認",
        links: [
          docLink("staff/dashboard", "打刻ダッシュボードを確認する"),
          docLink("staff/time-recording", "出退勤を打刻する"),
          docLink("staff/attendance-check", "勤怠を確認する"),
          docLink("staff/attendance-edit", "勤怠を修正する"),
          docLink("staff/attendance-statistics", "稼働統計を確認する"),
          docLink("staff/break-time-guide", "休憩時間を正しく記録する"),
        ],
      },
      {
        title: "申請と提出",
        links: [
          docLink("staff/attendance-report", "日報を記録する"),
          docLink("staff/workflow", "ワークフロー申請を操作する"),
          docLink("staff/request-check", "申請を確認する"),
        ],
      },
      {
        title: "個人向け設定と参照",
        links: [
          docLink("staff/profile-settings", "個人設定を管理する"),
          docLink("staff/shift", "シフトを確認・編集する"),
          docLink("work-type-overview", "勤務形態の見方"),
          docLink("work-status-overview", "勤務ステータスの見方"),
        ],
      },
      {
        title: "全体の入口",
        links: [
          docLink("staff/overview", "スタッフ向けガイド"),
          docLink("staff/navigation-map", "画面遷移マップ（スタッフ向け）"),
          docLink("staff/faq", "よくある質問"),
        ],
      },
    ],
  },
};

export const adminGuide: RoleGuideDefinition = {
  sidebar: {
    label: "管理者向けガイド",
    overviewDocId: "admin/overview",
    navigationDocId: "admin/navigation-map",
    faqDocId: "admin/faq",
    useCasesLabel: "ユースケース別",
    featuresLabel: "機能別",
  },
  overview: {
    intro:
      "このセクションは、管理者の日常運用に必要な操作をまとめたガイドです。",
    sections: [
      {
        title: "探し方は 2 通りあります",
        links: [
          docLink("admin/use-cases", "業務の目的から探す: ユースケース別ガイド"),
          docLink("admin/features", "機能や画面から探す: 機能別ガイド"),
        ],
      },
      {
        title: "管理者が行う主な作業",
        links: [
          docLink("admin/request-approval", "申請の承認、却下"),
          docLink("admin/attendance-management", "要確認データの確認と解消"),
          docLink("admin/dashboard", "月次締め前の最終確認"),
        ],
      },
      {
        title: "最初に確認するページ",
        links: [
          docLink("work-type-overview", "勤務形態の見方"),
          docLink("admin/navigation-map", "画面遷移マップ"),
          docLink("admin/dashboard", "ダッシュボードを確認する"),
          docLink("admin/attendance-management", "勤怠を管理する"),
          docLink("admin/attendances", "勤怠一覧を確認する"),
          docLink("admin/request-approval", "申請を承認する"),
        ],
      },
      {
        title: "必要に応じて使うページ",
        links: [
          docLink("screen-list", "画面一覧"),
          docLink("admin/use-cases", "ユースケース別ガイド"),
          docLink("admin/features", "機能別ガイド"),
          docLink("admin/daily-report", "日報を管理する"),
          docLink("admin/admin-shift", "シフトを管理する"),
          docLink("admin/shift-plan", "シフト計画を作成する"),
          docLink("admin/operation-logs", "操作ログを確認する"),
          docLink("admin/settings-management", "設定画面を管理する"),
          docLink("admin/settings-item-list", "設定項目一覧を確認する"),
          docLink("admin/staff-management", "スタッフを管理する"),
          docLink("work-type-overview", "勤務形態の見方"),
          docLink("admin/faq", "よくある質問"),
        ],
      },
    ],
  },
  useCases: {
    intro:
      "管理者向けドキュメントを、やりたい業務から探すための入口です。",
    relatedGuide: {
      prefix: "機能や画面から探したい場合は、",
      link: docLink("admin/features", "機能別ガイド"),
      suffix: "を参照してください。",
    },
    sections: [
      {
        title: "日々の優先対応を決めたい",
        links: [
          docLink("admin/dashboard", "ダッシュボードを確認する"),
          docLink("admin/attendance-management", "勤怠を管理する"),
          docLink("admin/attendances", "勤怠一覧を確認する"),
        ],
      },
      {
        title: "申請を処理したい",
        links: [
          docLink("admin/request-approval", "申請を承認する"),
          docLink("admin/break-time-review-guide", "休憩時間申請をレビューする"),
          docLink("admin/workflow", "ワークフロー申請を管理する"),
        ],
      },
      {
        title: "未対応データを減らしたい",
        links: [
          docLink("admin/daily-report", "日報を管理する"),
          docLink("admin/attendances", "勤怠一覧を確認する"),
          docLink("admin/operation-logs", "操作ログを確認する"),
        ],
      },
      {
        title: "運用設定を見直したい",
        links: [
          docLink("admin/settings-management", "設定画面を管理する"),
          docLink("admin/settings-item-list", "設定項目一覧を確認する"),
          docLink("admin/staff-management", "スタッフを管理する"),
        ],
      },
      {
        title: "シフト運用を進めたい",
        links: [
          docLink("admin/admin-shift", "シフトを管理する"),
          docLink("admin/shift-plan", "シフト計画を作成する"),
          docLink("admin/navigation-map", "画面遷移マップ（管理者向け）"),
        ],
      },
    ],
  },
  features: {
    intro:
      "管理者向けドキュメントを、機能や画面から探すための入口です。",
    relatedGuide: {
      prefix: "業務フローや目的から探したい場合は、",
      link: docLink("admin/use-cases", "ユースケース別ガイド"),
      suffix: "を参照してください。",
    },
    sections: [
      {
        title: "勤怠管理",
        links: [
          docLink("admin/dashboard", "ダッシュボードを確認する"),
          docLink("admin/attendances", "勤怠一覧を確認する"),
          docLink("admin/attendance-management", "勤怠を管理する"),
          docLink("admin/daily-report", "日報を管理する"),
        ],
      },
      {
        title: "申請管理",
        links: [
          docLink("admin/request-approval", "申請を承認する"),
          docLink("admin/break-time-review-guide", "休憩時間申請をレビューする"),
          docLink("admin/workflow", "ワークフロー申請を管理する"),
        ],
      },
      {
        title: "シフトとスタッフ管理",
        links: [
          docLink("admin/admin-shift", "シフトを管理する"),
          docLink("admin/shift-plan", "シフト計画を作成する"),
          docLink("admin/staff-management", "スタッフを管理する"),
        ],
      },
      {
        title: "設定と監査",
        links: [
          docLink("admin/settings-management", "設定画面を管理する"),
          docLink("admin/settings-item-list", "設定項目一覧を確認する"),
          docLink("admin/operation-logs", "操作ログを確認する"),
        ],
      },
      {
        title: "全体の入口",
        links: [
          docLink("admin/overview", "管理者向けガイド"),
          docLink("admin/navigation-map", "画面遷移マップ（管理者向け）"),
          docLink("admin/faq", "よくある質問"),
        ],
      },
    ],
  },
};

export const roleGuideSidebars = [staffGuide, adminGuide].map((guide) => ({
  ...guide.sidebar,
  useCaseDocIds: uniqueDocIds(guide.useCases.sections),
  featureDocIds: uniqueDocIds(guide.features.sections),
}));
