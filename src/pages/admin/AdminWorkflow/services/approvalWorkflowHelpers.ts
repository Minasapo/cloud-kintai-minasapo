import {
  ApprovalStatus,
  ApprovalStep,
  ApprovalStepInput,
  GetWorkflowQuery,
  WorkflowComment,
  WorkflowCommentInput,
  WorkflowStatus,
} from "@shared/api/graphql/types";

import {
  diagnoseWorkflowData,
  type WorkflowDataIssue,
} from "./workflowDataDiagnostics";

type WorkflowData = NonNullable<GetWorkflowQuery["getWorkflow"]>;

export type WorkflowActionState = {
  canApprove: boolean;
  canReject: boolean;
  warningMessage: string | null;
  warningTone: "info" | "warning" | "error" | null;
  issue: WorkflowDataIssue;
};

export const buildApprovalStepInputs = (
  workflow: WorkflowData
): ApprovalStepInput[] => {
  let steps: ApprovalStepInput[] = [];

  if (workflow.approvalSteps && workflow.approvalSteps.length > 0) {
    steps = (workflow.approvalSteps as ApprovalStep[]).map((step) => ({
      id: step.id,
      approverStaffId: step.approverStaffId,
      decisionStatus: step.decisionStatus as ApprovalStatus,
      approverComment: step.approverComment ?? null,
      decisionTimestamp: step.decisionTimestamp ?? null,
      stepOrder: step.stepOrder ?? 0,
    }));
  } else if (
    workflow.assignedApproverStaffIds &&
    workflow.assignedApproverStaffIds.length > 0
  ) {
    steps = workflow.assignedApproverStaffIds.map((approverId, index) => ({
      id: `s-${index}-${workflow.id}`,
      approverStaffId: approverId || "",
      decisionStatus: ApprovalStatus.PENDING,
      approverComment: null,
      decisionTimestamp: null,
      stepOrder: index,
    }));
  }

  if (steps.length === 0) {
    return [
      {
        id: `fallback-${workflow.id}`,
        approverStaffId: "ADMINS",
        decisionStatus: ApprovalStatus.PENDING,
        approverComment: null,
        decisionTimestamp: null,
        stepOrder: 0,
      },
    ];
  }

  return steps;
};

export const resolvePendingApprovalStepIndex = (
  steps: ApprovalStepInput[],
  nextApprovalStepIndex: number | null | undefined
): number => {
  if (
    typeof nextApprovalStepIndex === "number" &&
    nextApprovalStepIndex >= 0 &&
    nextApprovalStepIndex < steps.length &&
    steps[nextApprovalStepIndex].decisionStatus === ApprovalStatus.PENDING
  ) {
    return nextApprovalStepIndex;
  }

  return steps.findIndex((step) => step.decisionStatus === ApprovalStatus.PENDING);
};

export const hasPendingApprovalStep = (
  workflow: WorkflowData | null | undefined
): boolean => {
  if (!workflow?.id) return false;

  const steps = buildApprovalStepInputs(workflow);
  return (
    resolvePendingApprovalStepIndex(steps, workflow.nextApprovalStepIndex) >= 0
  );
};

export const canApproveWorkflow = (
  workflow: WorkflowData | null | undefined
): boolean => {
  if (!workflow?.id) return false;
  if (
    workflow.status === WorkflowStatus.APPROVED ||
    workflow.status === WorkflowStatus.CANCELLED
  ) {
    return false;
  }
  return hasPendingApprovalStep(workflow);
};

export const canRejectWorkflow = (
  workflow: WorkflowData | null | undefined
): boolean => {
  if (!workflow?.id) return false;
  if (
    workflow.status === WorkflowStatus.REJECTED ||
    workflow.status === WorkflowStatus.CANCELLED
  ) {
    return false;
  }
  if (workflow.status === WorkflowStatus.APPROVED) {
    return true;
  }
  return hasPendingApprovalStep(workflow);
};

export const resolveWorkflowActionState = (
  workflow: WorkflowData | null | undefined,
): WorkflowActionState => {
  const diagnosis = diagnoseWorkflowData(workflow);

  if (!workflow?.id) {
    return {
      canApprove: false,
      canReject: false,
      warningMessage: null,
      warningTone: null,
      issue: diagnosis.issue,
    };
  }

  const canApprove = canApproveWorkflow(workflow);
  const canReject = canRejectWorkflow(workflow);
  const warningMessage = diagnosis.reason || null;

  let warningTone: WorkflowActionState["warningTone"] = null;
  if (warningMessage) {
    warningTone =
      diagnosis.issue === "missing_both"
        ? "error"
        : diagnosis.issue === "all_steps_decided"
          ? "warning"
          : diagnosis.issue === "inconsistent_index"
            ? "warning"
            : diagnosis.issue === "missing_approval_steps"
              ? "info"
              : null;
  }

  return {
    canApprove,
    canReject,
    warningMessage,
    warningTone,
    issue: diagnosis.issue,
  };
};

export const mapCommentsToInputs = (
  comments?: Array<WorkflowComment | null> | null
): WorkflowCommentInput[] =>
  (comments || [])
    .filter((comment): comment is WorkflowComment => Boolean(comment))
    .map((comment) => ({
      id: comment.id,
      staffId: comment.staffId,
      text: comment.text,
      createdAt: comment.createdAt,
    }));

export const createSystemComment = (text: string): WorkflowCommentInput => ({
  id: `c-${Date.now()}`,
  staffId: "system",
  text,
  createdAt: new Date().toISOString(),
});
