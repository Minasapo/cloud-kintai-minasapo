import {
  ApprovalStatus,
  ApprovalStep,
  ApprovalStepInput,
  GetWorkflowQuery,
  UpdateWorkflowInput,
} from "@shared/api/graphql/types";

type WorkflowData = NonNullable<GetWorkflowQuery["getWorkflow"]>;

type ResubmissionApprovalResetInput = Pick<
  UpdateWorkflowInput,
  | "approvalSteps"
  | "assignedApproverStaffIds"
  | "nextApprovalStepIndex"
  | "approvedStaffIds"
  | "rejectedStaffIds"
  | "finalDecisionTimestamp"
>;

const buildStepsForResubmission = (workflow: WorkflowData): ApprovalStepInput[] => {
  if (workflow.approvalSteps && workflow.approvalSteps.length > 0) {
    return (workflow.approvalSteps as ApprovalStep[])
      .toSorted((a, b) => (a.stepOrder ?? 0) - (b.stepOrder ?? 0))
      .map((step, index) => ({
        id: step.id ?? `resubmit-${index}-${workflow.id}`,
        approverStaffId: step.approverStaffId,
        decisionStatus: ApprovalStatus.PENDING,
        approverComment: null,
        decisionTimestamp: null,
        stepOrder: step.stepOrder ?? index,
      }));
  }

  if (
    workflow.assignedApproverStaffIds &&
    workflow.assignedApproverStaffIds.length > 0
  ) {
    return workflow.assignedApproverStaffIds
      .filter((staffId): staffId is string => Boolean(staffId))
      .map((staffId, index) => ({
        id: `resubmit-${index}-${workflow.id}`,
        approverStaffId: staffId,
        decisionStatus: ApprovalStatus.PENDING,
        approverComment: null,
        decisionTimestamp: null,
        stepOrder: index,
      }));
  }

  return [
    {
      id: `resubmit-admin-${workflow.id}`,
      approverStaffId: "ADMINS",
      decisionStatus: ApprovalStatus.PENDING,
      approverComment: null,
      decisionTimestamp: null,
      stepOrder: 0,
    },
  ];
};

export const buildResubmissionApprovalResetInput = (
  workflow: WorkflowData,
): ResubmissionApprovalResetInput => {
  const approvalSteps = buildStepsForResubmission(workflow);
  const assignedApproverStaffIds = Array.from(
    new Set(
      approvalSteps
        .map((step) => step.approverStaffId)
        .filter((staffId): staffId is string => Boolean(staffId)),
    ),
  );

  return {
    approvalSteps,
    assignedApproverStaffIds,
    nextApprovalStepIndex: approvalSteps.length > 0 ? 0 : null,
    approvedStaffIds: [],
    rejectedStaffIds: [],
    finalDecisionTimestamp: null,
  };
};
