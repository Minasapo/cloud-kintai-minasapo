import {
  ApprovalStatus,
  WorkflowStatus,
} from "@shared/api/graphql/types";
import { createMockWorkflow } from "@shared/test-utils";

import { buildWorkflowRepairPlan } from "../workflowRepair";

describe("buildWorkflowRepairPlan", () => {
  it("all_steps_decided では承認結果に合わせてステータスを最新化する", () => {
    const workflow = createMockWorkflow({
      id: "wf-1",
      status: WorkflowStatus.SUBMITTED,
      approvalSteps: [
        {
          __typename: "ApprovalStep" as const,
          id: "step-1",
          approverStaffId: "staff-1",
          decisionStatus: ApprovalStatus.APPROVED,
          approverComment: null,
          decisionTimestamp: "2026-06-20T10:00:00.000Z",
          stepOrder: 0,
        },
        {
          __typename: "ApprovalStep" as const,
          id: "step-2",
          approverStaffId: "staff-2",
          decisionStatus: ApprovalStatus.REJECTED,
          approverComment: null,
          decisionTimestamp: "2026-06-20T11:00:00.000Z",
          stepOrder: 1,
        },
      ],
      assignedApproverStaffIds: ["staff-1", "staff-2"],
      comments: [],
    });

    const plan = buildWorkflowRepairPlan(workflow);

    expect(plan).not.toBeNull();
    expect(plan?.actionLabel).toBe("データを自動修復");
    expect(plan?.input.status).toBe(WorkflowStatus.REJECTED);
    expect(plan?.input.nextApprovalStepIndex).toBeUndefined();
    expect(plan?.input.rejectedStaffIds).toEqual(["staff-2"]);
    expect(plan?.input.approvedStaffIds).toEqual(["staff-1"]);
    expect(plan?.input.finalDecisionTimestamp).toBe("2026-06-20T11:00:00.000Z");
    expect(plan?.repairReason).toBe(
      "すべての承認ステップが決定済みのため、最終ステータスを確定します"
    );
    expect(plan?.repairDetails.length).toBeGreaterThan(0);
  });

  it("missing_both では ADMINS を使って承認チェーンを再構築する", () => {
    const workflow = createMockWorkflow({
      id: "wf-2",
      status: WorkflowStatus.SUBMITTED,
      approvalSteps: [],
      assignedApproverStaffIds: [],
      comments: [],
    });

    const plan = buildWorkflowRepairPlan(workflow);

    expect(plan).not.toBeNull();
    expect(plan?.actionLabel).toBe("データを自動修復");
    expect(plan?.input.status).toBe(WorkflowStatus.SUBMITTED);
    expect(plan?.input.nextApprovalStepIndex).toBe(0);
    expect(plan?.input.approvalSteps?.[0]?.approverStaffId).toBe("ADMINS");
    expect(plan?.input.approvalSteps?.[0]?.decisionStatus).toBe(
      ApprovalStatus.PENDING,
    );
    expect(plan?.repairReason).toBe(
      "承認ステップの構築に問題があります。承認フローをリセットします"
    );
    expect(plan?.repairDetails.length).toBeGreaterThan(0);
  });

  it("inconsistent_index では pending step の位置に index を合わせる", () => {
    const workflow = createMockWorkflow({
      id: "wf-3",
      status: WorkflowStatus.SUBMITTED,
      approvalSteps: [
        {
          __typename: "ApprovalStep" as const,
          id: "step-1",
          approverStaffId: "staff-1",
          decisionStatus: ApprovalStatus.APPROVED,
          approverComment: null,
          decisionTimestamp: "2026-06-20T10:00:00.000Z",
          stepOrder: 0,
        },
        {
          __typename: "ApprovalStep" as const,
          id: "step-2",
          approverStaffId: "staff-2",
          decisionStatus: ApprovalStatus.PENDING,
          approverComment: null,
          decisionTimestamp: null,
          stepOrder: 1,
        },
      ],
      assignedApproverStaffIds: ["staff-1", "staff-2"],
      nextApprovalStepIndex: 99,
      comments: [],
    });

    const plan = buildWorkflowRepairPlan(workflow);

    expect(plan).not.toBeNull();
    expect(plan?.actionLabel).toBe("データを自動修復");
    expect(plan?.input.nextApprovalStepIndex).toBe(1);
    expect(plan?.input.status).toBeUndefined();
    expect(plan?.repairReason).toBe(
      "次の承認ステップインデックスが範囲外です。正しいインデックスに修正します"
    );
    expect(plan?.repairDetails.length).toBeGreaterThan(0);
  });

  it("all_steps_decided でも最終状態が整合していれば修復プランを作らない", () => {
    const workflow = createMockWorkflow({
      id: "wf-4",
      status: WorkflowStatus.APPROVED,
      approvedStaffIds: ["staff-1"],
      rejectedStaffIds: [],
      finalDecisionTimestamp: "2026-06-20T10:00:00.000Z",
      nextApprovalStepIndex: null,
      approvalSteps: [
        {
          __typename: "ApprovalStep" as const,
          id: "step-1",
          approverStaffId: "staff-1",
          decisionStatus: ApprovalStatus.APPROVED,
          approverComment: null,
          decisionTimestamp: "2026-06-20T10:00:00.000Z",
          stepOrder: 0,
        },
      ],
      assignedApproverStaffIds: ["staff-1"],
      comments: [],
    });

    const plan = buildWorkflowRepairPlan(workflow);

    expect(plan).toBeNull();
  });
});
