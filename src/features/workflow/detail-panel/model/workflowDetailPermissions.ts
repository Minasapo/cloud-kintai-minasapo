import { WorkflowStatus } from "@shared/api/graphql/types";

export type WorkflowSummary = {
  id?: string | null;
  status?: WorkflowStatus | null;
};

export type WorkflowDetailPermissions = {
  isSubmittedOrLater: boolean;
  isFinalized: boolean;
  editDisabled: boolean;
  editTooltip?: string;
  withdrawDisabled: boolean;
  withdrawTooltip?: string;
};

const SUBMITTED_OR_LATER = new Set<WorkflowStatus>([
  WorkflowStatus.SUBMITTED,
  WorkflowStatus.PENDING,
  WorkflowStatus.APPROVED,
  WorkflowStatus.REJECTED,
  WorkflowStatus.CANCELLED,
]);

export const deriveWorkflowDetailPermissions = (
  workflow?: WorkflowSummary | null
): WorkflowDetailPermissions => {
  const status = workflow?.status ?? null;
  const isSubmittedOrLater = Boolean(status && SUBMITTED_OR_LATER.has(status));
  const isFinalized = Boolean(
    status &&
      (status === WorkflowStatus.APPROVED || status === WorkflowStatus.REJECTED)
  );
  const isCancelled = status === WorkflowStatus.CANCELLED;
  const isRejected = status === WorkflowStatus.REJECTED;
  const isApproved = status === WorkflowStatus.APPROVED;
  const hasIdentifier = Boolean(workflow?.id);

  // 却下済み(REJECTED)の申請は再度編集可能にする
  const editDisabled = !hasIdentifier || (isSubmittedOrLater && !isRejected);
  const editTooltip =
    isSubmittedOrLater && !isRejected
      ? "提出済み以降の申請は編集できません"
      : undefined;

  // 却下済み(REJECTED)の申請は取り下げ可能にする（承認済みは不可）
  const withdrawDisabled = !hasIdentifier || isCancelled || isApproved;
  const withdrawTooltip = isCancelled
    ? "キャンセル済みのワークフローは取り下げできません"
    : isApproved
    ? "承認済みの申請は取り下げできません"
    : undefined;

  return {
    isSubmittedOrLater,
    isFinalized,
    editDisabled,
    editTooltip,
    withdrawDisabled,
    withdrawTooltip,
  };
};
