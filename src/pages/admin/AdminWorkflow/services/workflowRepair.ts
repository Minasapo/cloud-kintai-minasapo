import { buildResubmissionApprovalResetInput } from "@features/workflow/lib/workflowResubmission";
import {
  ApprovalStatus,
  GetWorkflowQuery,
  UpdateWorkflowInput,
  WorkflowStatus,
} from "@shared/api/graphql/types";

import {
  buildApprovalStepInputs,
  createSystemComment,
  mapCommentsToInputs,
} from "./approvalWorkflowHelpers";
import { diagnoseWorkflowData, type WorkflowDataIssue } from "./workflowDataDiagnostics";

type WorkflowData = NonNullable<GetWorkflowQuery["getWorkflow"]>;

export type WorkflowRepairPlan = {
  input: UpdateWorkflowInput;
  actionLabel: string;
  successMessage: string;
  repairReason: string;
  repairDetails: string[];
};

const deriveLatestDecisionTimestamp = (workflow: WorkflowData): string => {
  const timestamps = (workflow.approvalSteps ?? [])
    .map((step) => step?.decisionTimestamp)
    .filter((timestamp): timestamp is string => Boolean(timestamp))
    .sort();

  return timestamps[timestamps.length - 1] ?? new Date().toISOString();
};

const buildFinalStatusRepairPlan = (workflow: WorkflowData): WorkflowRepairPlan => {
  const steps = buildApprovalStepInputs(workflow);
  const rejectedStaffIds = Array.from(
    new Set(
      steps
        .filter((step) => step.decisionStatus === ApprovalStatus.REJECTED)
        .map((step) => step.approverStaffId)
        .filter((staffId): staffId is string => Boolean(staffId)),
    ),
  );
  const approvedStaffIds = Array.from(
    new Set(
      steps
        .filter((step) => step.decisionStatus === ApprovalStatus.APPROVED)
        .map((step) => step.approverStaffId)
        .filter((staffId): staffId is string => Boolean(staffId)),
    ),
  );
  const status =
    rejectedStaffIds.length > 0 ? WorkflowStatus.REJECTED : WorkflowStatus.APPROVED;

  const details = [
    `現在のステータス: ${workflow.status}`,
    `修復後のステータス: ${status}`,
    `承認者: ${approvedStaffIds.length}件`,
    `却下者: ${rejectedStaffIds.length}件`,
  ];

  return {
    input: {
      id: workflow.id,
      approvalSteps: steps,
      status,
      approvedStaffIds,
      rejectedStaffIds,
      finalDecisionTimestamp: deriveLatestDecisionTimestamp(workflow),
      nextApprovalStepIndex: undefined,
      comments: [
        ...mapCommentsToInputs(workflow.comments),
        createSystemComment("データを自動修復しました"),
      ],
    },
    actionLabel: "データを自動修復",
    successMessage: "データを自動修復しました",
    repairReason: "すべての承認ステップが決定済みのため、最終ステータスを確定します",
    repairDetails: details,
  };
};

const buildApprovalChainRepairPlan = (workflow: WorkflowData): WorkflowRepairPlan => {
  const resetInput = buildResubmissionApprovalResetInput(workflow);
  const details = [
    `現在のステータス: ${workflow.status}`,
    `修復後のステータス: ${WorkflowStatus.SUBMITTED}`,
    `次の承認ステップ: 最初から開始`,
  ];

  return {
    input: {
      id: workflow.id,
      ...resetInput,
      status: WorkflowStatus.SUBMITTED,
      comments: [
        ...mapCommentsToInputs(workflow.comments),
        createSystemComment("データを自動修復しました"),
      ],
    },
    actionLabel: "データを自動修復",
    successMessage: "データを自動修復しました",
    repairReason: "承認ステップの構築に問題があります。承認フローをリセットします",
    repairDetails: details,
  };
};

const buildIndexRepairPlan = (workflow: WorkflowData): WorkflowRepairPlan => {
  const steps = buildApprovalStepInputs(workflow);
  const pendingIndex = steps.findIndex(
    (step) => step.decisionStatus === ApprovalStatus.PENDING,
  );
  const correctedIndex = pendingIndex >= 0 ? pendingIndex : 0;

  const details = [
    `現在のステップインデックス: ${workflow.nextApprovalStepIndex}`,
    `修復後のステップインデックス: ${correctedIndex}`,
    `総承認ステップ数: ${steps.length}`,
  ];

  return {
    input: {
      id: workflow.id,
      nextApprovalStepIndex: correctedIndex,
      comments: [
        ...mapCommentsToInputs(workflow.comments),
        createSystemComment("データを自動修復しました"),
      ],
    },
    actionLabel: "データを自動修復",
    successMessage: "データを自動修復しました",
    repairReason: "次の承認ステップインデックスが範囲外です。正しいインデックスに修正します",
    repairDetails: details,
  };
};

export const buildWorkflowRepairPlan = (
  workflow: WorkflowData | null | undefined,
  issue?: WorkflowDataIssue,
): WorkflowRepairPlan | null => {
  if (!workflow?.id) return null;

  const diagnosisIssue = issue ?? diagnoseWorkflowData(workflow).issue;

  if (diagnosisIssue === "missing_both" || diagnosisIssue === "missing_approval_steps") {
    return buildApprovalChainRepairPlan(workflow);
  }

  if (diagnosisIssue === "all_steps_decided") {
    return buildFinalStatusRepairPlan(workflow);
  }

  if (diagnosisIssue === "inconsistent_index") {
    return buildIndexRepairPlan(workflow);
  }

  return null;
};

export const getWorkflowRepairIssue = (
  workflow: WorkflowData | null | undefined,
): WorkflowDataIssue => diagnoseWorkflowData(workflow).issue;