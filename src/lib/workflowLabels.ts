import { WorkflowCategory, WorkflowStatus } from "@shared/api/graphql/types";

export const CLOCK_CORRECTION_CHECK_IN_LABEL = "打刻修正(出勤忘れ)";
export const CLOCK_CORRECTION_CHECK_OUT_LABEL = "打刻修正(退勤忘れ)";
export const CLOCK_CORRECTION_LABEL = CLOCK_CORRECTION_CHECK_IN_LABEL;
const CLOCK_CORRECTION_DISPLAY_LABEL = "打刻修正(出勤/退勤忘れ)";

export const CATEGORY_LABELS: Record<string, string> = {
  [WorkflowCategory.PAID_LEAVE]: "有給休暇申請",
  [WorkflowCategory.ABSENCE]: "欠勤申請",
  [WorkflowCategory.OVERTIME]: "残業申請",
  [WorkflowCategory.CLOCK_CORRECTION]: CLOCK_CORRECTION_DISPLAY_LABEL,
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

export const REVERSE_CATEGORY: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(CATEGORY_LABELS).map(([k, v]) => [v, k])
  ),
  [CLOCK_CORRECTION_CHECK_IN_LABEL]: WorkflowCategory.CLOCK_CORRECTION,
  [CLOCK_CORRECTION_CHECK_OUT_LABEL]: WorkflowCategory.CLOCK_CORRECTION,
};
export const REVERSE_STATUS: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_LABELS).map(([k, v]) => [v, k])
);

type WorkflowLike = {
  category?: WorkflowCategory | null;
  overTimeDetails?: { reason?: string | null } | null;
} | null;

export const resolveClockCorrectionLabel = (reason?: string | null): string => {
  if (reason === CLOCK_CORRECTION_CHECK_OUT_LABEL)
    return CLOCK_CORRECTION_CHECK_OUT_LABEL;
  if (reason === CLOCK_CORRECTION_CHECK_IN_LABEL)
    return CLOCK_CORRECTION_CHECK_IN_LABEL;
  return CLOCK_CORRECTION_DISPLAY_LABEL;
};

export const getWorkflowCategoryLabel = (workflow: WorkflowLike): string => {
  if (!workflow?.category) return "-";
  if (workflow.category === WorkflowCategory.CLOCK_CORRECTION) {
    return resolveClockCorrectionLabel(workflow.overTimeDetails?.reason);
  }
  return (
    CATEGORY_LABELS[workflow.category as WorkflowCategory] ||
    String(workflow.category)
  );
};
