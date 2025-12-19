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
  const hasIdentifier = Boolean(workflow?.id);

  const editDisabled = !hasIdentifier || isSubmittedOrLater;
  const editTooltip = isSubmittedOrLater
    ? "提出済み以降の申請は編集できません"
    : undefined;

  const withdrawDisabled = !hasIdentifier || isCancelled || isFinalized;
  const withdrawTooltip = isCancelled
    ? "キャンセル済みのワークフローは取り下げできません"
    : isFinalized
    ? "承認済みまたは却下済みの申請は取り下げできません"
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
