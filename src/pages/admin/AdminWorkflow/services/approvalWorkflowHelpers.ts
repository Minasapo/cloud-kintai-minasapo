import {
  ApprovalStatus,
  ApprovalStep,
  ApprovalStepInput,
  GetWorkflowQuery,
  WorkflowComment,
  WorkflowCommentInput,
} from "@shared/api/graphql/types";

type WorkflowData = NonNullable<GetWorkflowQuery["getWorkflow"]>;

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
