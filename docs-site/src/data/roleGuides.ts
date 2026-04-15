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
    useCasesDocId: string;
    featuresDocId: string;
    navigationDocId: string;
    faqDocId: string;
    useCasesLabel: string;
    featuresLabel: string;
    useCaseDocIds: string[];
    featureDocIds: string[];
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

export const staffGuide: RoleGuideDefinition = {
  sidebar: {
    label: "スタッフ向けガイド",
    overviewDocId: "staff/overview",
    useCasesDocId: "staff/use-cases",
    featuresDocId: "staff/features",
    navigationDocId: "staff/navigation-map",
    faqDocId: "staff/faq",
    useCasesLabel: "ユースケース別",
    featuresLabel: "機能別",
    useCaseDocIds: [
      "staff/basic-operations",
      "staff/time-recording",
      "staff/attendance-check",
      "staff/attendance-edit",
      "staff/request-check",
      "staff/attendance-report",
      "staff/workflow",
    ],
    featureDocIds: [
      "staff/dashboard",
      "staff/attendance-statistics",
      "staff/shift",
      "staff/profile-settings",
      "staff/break-time-guide",
    ],
  },
  overview: {
    intro:
      "このセクションは、日々の勤怠業務を進めるスタッフ向けの入口です。まず共通ガイドで前提をそろえ、その後は目的別または機能別に辿ってください。",
    sections: [
      {
        title: "最初に確認する共通ガイド",
        links: [
          docLink("attendance-workflow-overview", "勤怠・関連申請の業務フロー全体像"),
          docLink("terminology", "用語集"),
          docLink("work-status-overview", "勤務ステータスの見方"),
          docLink("work-type-overview", "勤務形態の見方"),
          docLink("screen-list", "画面一覧"),
        ],
      },
      {
        title: "目的から探す",
        links: [
          docLink("staff/use-cases", "ユースケース別ガイド"),
          docLink("staff/basic-operations", "基本操作"),
          docLink("staff/time-recording", "出退勤を打刻する"),
          docLink("staff/attendance-edit", "勤怠を修正する"),
          docLink("staff/attendance-report", "日報を記録する"),
        ],
      },
      {
        title: "機能や画面から探す",
        links: [
          docLink("staff/features", "機能別ガイド"),
          docLink("staff/dashboard", "打刻ダッシュボードを確認する"),
          docLink("staff/attendance-statistics", "稼働統計を確認する"),
          docLink("staff/shift", "シフトを確認・編集する"),
          docLink("staff/profile-settings", "個人設定を管理する"),
        ],
      },
      {
        title: "困ったときに見るページ",
        links: [
          docLink("staff/navigation-map", "画面遷移マップ（スタッフ向け）"),
          docLink("staff/request-check", "申請を確認する"),
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
          docLink("attendance-workflow-overview", "勤怠・関連申請の業務フロー全体像"),
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
          docLink("attendance-workflow-overview", "勤怠・関連申請の業務フロー全体像"),
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
    useCasesDocId: "admin/use-cases",
    featuresDocId: "admin/features",
    navigationDocId: "admin/navigation-map",
    faqDocId: "admin/faq",
    useCasesLabel: "ユースケース別",
    featuresLabel: "機能別",
    useCaseDocIds: [
      "admin/attendance-management",
      "admin/request-approval",
      "admin/break-time-review-guide",
      "admin/daily-report",
      "admin/shift-plan",
    ],
    featureDocIds: [
      "admin/dashboard",
      "admin/attendances",
      "admin/admin-shift",
      "admin/operation-logs",
      "admin/settings-management",
      "admin/settings-item-list",
      "admin/office-mode-operations",
      "admin/time-recorder-support-settings",
      "admin/workflow-settings",
      "admin/export-and-developer-settings",
      "admin/staff-management",
    ],
  },
  overview: {
    intro:
      "このセクションは、管理者の日常運用と月次対応を進めるための入口です。共通ガイドで前提を確認し、その後は目的別または機能別ガイドから必要なページへ辿ってください。",
    sections: [
      {
        title: "最初に確認する共通ガイド",
        links: [
          docLink("attendance-workflow-overview", "勤怠・関連申請の業務フロー全体像"),
          docLink("terminology", "用語集"),
          docLink("work-status-overview", "勤務ステータスの見方"),
          docLink("work-type-overview", "勤務形態の見方"),
          docLink("screen-list", "画面一覧"),
        ],
      },
      {
        title: "日々の優先対応から探す",
        links: [
          docLink("admin/use-cases", "ユースケース別ガイド"),
          docLink("admin/dashboard", "ダッシュボードを確認する"),
          docLink("admin/attendance-management", "勤怠を管理する"),
          docLink("admin/request-approval", "申請を承認する"),
          docLink("admin/daily-report", "日報を管理する"),
        ],
      },
      {
        title: "機能や画面から探す",
        links: [
          docLink("admin/features", "機能別ガイド"),
          docLink("admin/attendances", "勤怠一覧を確認する"),
          docLink("admin/admin-shift", "シフトを管理する"),
          docLink("admin/shift-plan", "シフト計画を作成する"),
          docLink("admin/staff-management", "スタッフを管理する"),
          docLink("admin/settings-management", "設定画面を管理する"),
        ],
      },
      {
        title: "判断に迷ったときに見るページ",
        links: [
          docLink("admin/navigation-map", "画面遷移マップ（管理者向け）"),
          docLink("admin/operation-logs", "操作ログを確認する"),
          docLink("admin/settings-management", "設定画面を管理する"),
          docLink("admin/settings-item-list", "設定項目一覧を確認する"),
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
          docLink("attendance-workflow-overview", "勤怠・関連申請の業務フロー全体像"),
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
          docLink("admin/time-recorder-support-settings", "打刻補助設定を管理する"),
          docLink("admin/workflow-settings", "ワークフロー設定を確認する"),
          docLink("admin/office-mode-operations", "オフィスモードを運用する"),
          docLink("admin/export-and-developer-settings", "エクスポートと開発者設定を確認する"),
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
          docLink("admin/workflow-settings", "ワークフロー設定を確認する"),
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
          docLink("admin/time-recorder-support-settings", "打刻補助設定を管理する"),
          docLink("admin/office-mode-operations", "オフィスモードを運用する"),
          docLink("admin/export-and-developer-settings", "エクスポートと開発者設定を確認する"),
          docLink("admin/operation-logs", "操作ログを確認する"),
        ],
      },
      {
        title: "全体の入口",
        links: [
          docLink("attendance-workflow-overview", "勤怠・関連申請の業務フロー全体像"),
          docLink("admin/overview", "管理者向けガイド"),
          docLink("admin/navigation-map", "画面遷移マップ（管理者向け）"),
          docLink("admin/faq", "よくある質問"),
        ],
      },
    ],
  },
};

export const roleGuideSidebars = [staffGuide, adminGuide].map(
  (guide) => guide.sidebar,
);
