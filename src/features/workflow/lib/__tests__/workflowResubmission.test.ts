import { buildResubmissionApprovalResetInput } from "@features/workflow/lib/workflowResubmission";
import {
  ApprovalStatus,
  GetWorkflowQuery,
  WorkflowStatus,
} from "@shared/api/graphql/types";

type WorkflowData = NonNullable<GetWorkflowQuery["getWorkflow"]>;

const makeWorkflow = (overrides: Partial<WorkflowData> = {}): WorkflowData =>
  ({
    __typename: "Workflow",
    id: "wf-1",
    staffId: "staff-1",
    status: WorkflowStatus.REJECTED,
    category: null,
    comments: [],
    approvalSteps: [],
    assignedApproverStaffIds: [],
    approvedStaffIds: ["approver-1"],
    rejectedStaffIds: ["approver-2"],
    finalDecisionTimestamp: "2026-06-20T00:00:00.000Z",
    nextApprovalStepIndex: null,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  }) as WorkflowData;

describe("buildResubmissionApprovalResetInput", () => {
  it("existing approvalSteps を全て PENDING に戻す", () => {
    const workflow = makeWorkflow({
      approvalSteps: [
        {
          __typename: "ApprovalStep",
          id: "step-1",
          approverStaffId: "approver-1",
          decisionStatus: ApprovalStatus.APPROVED,
          approverComment: "ok",
          decisionTimestamp: "2026-06-20T00:00:00.000Z",
          stepOrder: 0,
        },
        {
          __typename: "ApprovalStep",
          id: "step-2",
          approverStaffId: "approver-2",
          decisionStatus: ApprovalStatus.REJECTED,
          approverComment: "ng",
          decisionTimestamp: "2026-06-20T01:00:00.000Z",
          stepOrder: 1,
        },
      ],
      assignedApproverStaffIds: ["approver-1", "approver-2"],
    });

    const result = buildResubmissionApprovalResetInput(workflow);

    expect(result.nextApprovalStepIndex).toBe(0);
    expect(result.approvedStaffIds).toEqual([]);
    expect(result.rejectedStaffIds).toEqual([]);
    expect(result.finalDecisionTimestamp).toBeNull();
    expect(result.assignedApproverStaffIds).toEqual(["approver-1", "approver-2"]);
    expect(result.approvalSteps).toEqual([
      expect.objectContaining({
        id: "step-1",
        approverStaffId: "approver-1",
        decisionStatus: ApprovalStatus.PENDING,
        approverComment: null,
        decisionTimestamp: null,
      }),
      expect.objectContaining({
        id: "step-2",
        approverStaffId: "approver-2",
        decisionStatus: ApprovalStatus.PENDING,
        approverComment: null,
        decisionTimestamp: null,
      }),
    ]);
  });

  it("approvalSteps がない場合は assignedApproverStaffIds から再構築する", () => {
    const workflow = makeWorkflow({
      approvalSteps: null,
      assignedApproverStaffIds: ["approver-3", "approver-4"],
    });

    const result = buildResubmissionApprovalResetInput(workflow);

    expect(result.assignedApproverStaffIds).toEqual(["approver-3", "approver-4"]);
    expect(result.approvalSteps).toEqual([
      expect.objectContaining({ approverStaffId: "approver-3", stepOrder: 0 }),
      expect.objectContaining({ approverStaffId: "approver-4", stepOrder: 1 }),
    ]);
    expect(
      result.approvalSteps?.every(
        (step) => step?.decisionStatus === ApprovalStatus.PENDING,
      ),
    ).toBe(true);
  });

  it("承認者情報が欠けている場合は ADMINS をフォールバックする", () => {
    const workflow = makeWorkflow({
      approvalSteps: null,
      assignedApproverStaffIds: null,
    });

    const result = buildResubmissionApprovalResetInput(workflow);

    expect(result.assignedApproverStaffIds).toEqual(["ADMINS"]);
    expect(result.nextApprovalStepIndex).toBe(0);
    expect(result.approvalSteps?.[0]).toEqual(
      expect.objectContaining({
        approverStaffId: "ADMINS",
        decisionStatus: ApprovalStatus.PENDING,
      }),
    );
  });
});
