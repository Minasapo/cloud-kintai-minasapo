import { WorkflowCategory, WorkflowStatus } from "@shared/api/graphql/types";

export const CATEGORY_LABELS: Record<string, string> = {
  [WorkflowCategory.PAID_LEAVE]: "有給休暇申請",
  [WorkflowCategory.ABSENCE]: "欠勤申請",
  [WorkflowCategory.OVERTIME]: "残業申請",
  [WorkflowCategory.CUSTOM]: "その他",
};

export const STATUS_LABELS: Record<string, string> = {
  [WorkflowStatus.DRAFT]: "下書き",
  [WorkflowStatus.SUBMITTED]: "提出済",
  [WorkflowStatus.PENDING]: "承認待ち",
  [WorkflowStatus.APPROVED]: "承認済",
  [WorkflowStatus.REJECTED]: "却下",
  [WorkflowStatus.CANCELLED]: "キャンセル",
};

export const REVERSE_CATEGORY: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_LABELS).map(([k, v]) => [v, k])
);
export const REVERSE_STATUS: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_LABELS).map(([k, v]) => [v, k])
);
