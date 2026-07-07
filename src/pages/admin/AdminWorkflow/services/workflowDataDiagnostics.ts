import {
  ApprovalStatus,
  GetWorkflowQuery,
  WorkflowStatus,
} from "@shared/api/graphql/types";
import { createLogger } from "@shared/lib/logger";

type WorkflowData = NonNullable<GetWorkflowQuery["getWorkflow"]>;

const logger = createLogger("workflowDataDiagnostics");

export type WorkflowDataIssue =
  | "missing_approval_steps"
  | "missing_assignedApprovers"
  | "missing_both"
  | "all_steps_decided"
  | "inconsistent_index"
  | "none";

export const diagnoseWorkflowData = (
  workflow: WorkflowData | null | undefined,
): {
  issue: WorkflowDataIssue;
  isActionable: boolean;
  reason: string;
} => {
  if (!workflow?.id) {
    return {
      issue: "none",
      isActionable: false,
      reason: "Workflow ID is missing",
    };
  }

  const hasApprovalSteps =
    workflow.approvalSteps && workflow.approvalSteps.length > 0;
  const hasAssignedApprovers =
    workflow.assignedApproverStaffIds &&
    workflow.assignedApproverStaffIds.length > 0;

  // Check for missing approval data
  if (!hasApprovalSteps && !hasAssignedApprovers) {
    logger.warn(`Workflow ${workflow.id}: missing both approvalSteps and assignedApproverStaffIds`, {
      status: workflow.status,
      nextApprovalStepIndex: workflow.nextApprovalStepIndex,
    });
    return {
      issue: "missing_both",
      isActionable: false,
      reason:
        "承認者情報が設定されていません。管理者に連絡してください。",
    };
  }

  if (!hasApprovalSteps && hasAssignedApprovers) {
    logger.warn(
      `Workflow ${workflow.id}: missing approvalSteps but has assignedApproverStaffIds`,
      {
        status: workflow.status,
        assignedApproverStaffIds: workflow.assignedApproverStaffIds,
      },
    );
    return {
      issue: "missing_approval_steps",
      isActionable: true,
      reason:
        "承認ステップの構築に問題があります。ただし処理可能な承認者情報があります。",
    };
  }

  const toUniqueStaffIds = (
    status: ApprovalStatus,
  ): string[] =>
    Array.from(
      new Set(
        (workflow.approvalSteps ?? [])
          .filter((step): step is NonNullable<typeof step> => Boolean(step))
          .filter((step) => step.decisionStatus === status)
          .map((step) => step.approverStaffId)
          .filter((staffId): staffId is string => Boolean(staffId)),
      ),
    );

  const hasSameMembers = (
    left?: Array<string | null> | null,
    right?: Array<string | null> | null,
  ): boolean => {
    const leftSet = new Set(
      (left ?? []).filter((value): value is string => Boolean(value)),
    );
    const rightSet = new Set(
      (right ?? []).filter((value): value is string => Boolean(value)),
    );
    if (leftSet.size !== rightSet.size) return false;
    return Array.from(leftSet).every((value) => rightSet.has(value));
  };

  // Check if all steps are already decided and final fields are inconsistent
  if (hasApprovalSteps) {
    const validSteps = (workflow.approvalSteps ?? []).filter(
      (step): step is NonNullable<typeof step> => Boolean(step),
    );
    const allDecided = validSteps.every(
      (step) => step.decisionStatus !== ApprovalStatus.PENDING,
    );

    if (allDecided && workflow.status !== WorkflowStatus.CANCELLED) {
      const expectedRejectedStaffIds = toUniqueStaffIds(ApprovalStatus.REJECTED);
      const expectedApprovedStaffIds = toUniqueStaffIds(ApprovalStatus.APPROVED);
      const expectedStatus =
        expectedRejectedStaffIds.length > 0
          ? WorkflowStatus.REJECTED
          : WorkflowStatus.APPROVED;

      const hasStatusMismatch = workflow.status !== expectedStatus;
      const hasApprovedStaffIdsMismatch = !hasSameMembers(
        workflow.approvedStaffIds,
        expectedApprovedStaffIds,
      );
      const hasRejectedStaffIdsMismatch = !hasSameMembers(
        workflow.rejectedStaffIds,
        expectedRejectedStaffIds,
      );
      const hasNextIndexMismatch = typeof workflow.nextApprovalStepIndex === "number";
      const hasFinalDecisionTimestampMismatch =
        validSteps.some((step) => Boolean(step.decisionTimestamp)) &&
        !workflow.finalDecisionTimestamp;

      const hasInconsistency =
        hasStatusMismatch ||
        hasApprovedStaffIdsMismatch ||
        hasRejectedStaffIdsMismatch ||
        hasNextIndexMismatch ||
        hasFinalDecisionTimestampMismatch;

      if (!hasInconsistency) {
        return {
          issue: "none",
          isActionable: true,
          reason: "",
        };
      }

      logger.warn(`Workflow ${workflow.id}: all steps decided but status is not final`, {
        status: workflow.status,
        approvalStepCount: workflow.approvalSteps?.length,
        stepStates: workflow.approvalSteps?.map((s) => s?.decisionStatus),
      });
      return {
        issue: "all_steps_decided",
        isActionable: true,
        reason: "承認ステップと最終状態に不整合があります。",
      };
    }
  }

  // Check for inconsistent nextApprovalStepIndex
  if (
    typeof workflow.nextApprovalStepIndex === "number" &&
    hasApprovalSteps &&
    (workflow.nextApprovalStepIndex < 0 ||
      workflow.nextApprovalStepIndex >= workflow.approvalSteps!.length)
  ) {
    logger.warn(
      `Workflow ${workflow.id}: nextApprovalStepIndex out of bounds`,
      {
        nextApprovalStepIndex: workflow.nextApprovalStepIndex,
        stepCount: workflow.approvalSteps?.length,
      },
    );
    return {
      issue: "inconsistent_index",
      isActionable: true,
      reason: "承認ステップのインデックスが不整合です。",
    };
  }

  return {
    issue: "none",
    isActionable: true,
    reason: "",
  };
};

export const shouldAutoFallbackToAdmins = (workflow: WorkflowData): boolean => {
  const diagnosis = diagnoseWorkflowData(workflow);
  return (
    diagnosis.issue === "missing_both" || diagnosis.issue === "missing_approval_steps"
  );
};
