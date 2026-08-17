import { ApprovalStatus,WorkflowStatus } from "@shared/api/graphql/types";
import { createMockWorkflow } from "@shared/test-utils";

import {
  diagnoseWorkflowData,
  shouldAutoFallbackToAdmins,
} from "../workflowDataDiagnostics";

describe("workflowDataDiagnostics", () => {
  describe("diagnoseWorkflowData", () => {
    it("approvalSteps と assignedApproverStaffIds が空の場合、missing_both を検出すること", () => {
      const workflow = createMockWorkflow({
        id: "wf-1",
        status: WorkflowStatus.SUBMITTED,
        approvalSteps: [],
        assignedApproverStaffIds: [],
      });

      const result = diagnoseWorkflowData(workflow);
      expect(result.issue).toBe("missing_both");
      expect(result.isActionable).toBe(false);
      expect(result.reason).toContain("承認者情報が設定されていません");
    });

    it("approvalSteps が空で assignedApproverStaffIds が空でない場合、missing_approval_steps を検出すること", () => {
      const workflow = createMockWorkflow({
        id: "wf-2",
        status: WorkflowStatus.SUBMITTED,
        approvalSteps: [],
        assignedApproverStaffIds: ["staff-1", "staff-2"],
      });

      const result = diagnoseWorkflowData(workflow);
      expect(result.issue).toBe("missing_approval_steps");
      expect(result.isActionable).toBe(true);
      expect(result.reason).toContain("承認ステップの構築に問題があります");
    });

    it("全ステップに決定があり最終状態が不整合な場合、all_steps_decided を検出すること", () => {
      const workflow = createMockWorkflow({
        id: "wf-3",
        status: WorkflowStatus.PENDING,
        approvalSteps: [
          {
            __typename: "ApprovalStep" as const,
            id: "step-1",
            approverStaffId: "staff-1",
            decisionStatus: ApprovalStatus.APPROVED,
            approverComment: "OK",
            decisionTimestamp: new Date().toISOString(),
            stepOrder: 0,
          },
        ],
      });

      const result = diagnoseWorkflowData(workflow);
      expect(result.issue).toBe("all_steps_decided");
      expect(result.isActionable).toBe(true);
      expect(result.reason).toContain("不整合");
    });

    it("全ステップの決定済みかつ最終状態が整合している場合、none を検出すること", () => {
      const workflow = createMockWorkflow({
        id: "wf-3-2",
        status: WorkflowStatus.APPROVED,
        approvedStaffIds: ["staff-1"],
        rejectedStaffIds: [],
        finalDecisionTimestamp: new Date().toISOString(),
        nextApprovalStepIndex: null,
        approvalSteps: [
          {
            __typename: "ApprovalStep" as const,
            id: "step-1",
            approverStaffId: "staff-1",
            decisionStatus: ApprovalStatus.APPROVED,
            approverComment: "OK",
            decisionTimestamp: new Date().toISOString(),
            stepOrder: 0,
          },
        ],
      });

      const result = diagnoseWorkflowData(workflow);
      expect(result.issue).toBe("none");
      expect(result.isActionable).toBe(true);
      expect(result.reason).toBe("");
    });

    it("ワークフローデータが有効な場合、none を検出すること", () => {
      const workflow = createMockWorkflow({
        id: "wf-4",
        status: WorkflowStatus.SUBMITTED,
        approvalSteps: [
          {
            __typename: "ApprovalStep" as const,
            id: "step-1",
            approverStaffId: "staff-1",
            decisionStatus: ApprovalStatus.PENDING,
            approverComment: null,
            decisionTimestamp: null,
            stepOrder: 0,
          },
        ],
      });

      const result = diagnoseWorkflowData(workflow);
      expect(result.issue).toBe("none");
      expect(result.isActionable).toBe(true);
      expect(result.reason).toBe("");
    });
  });

  describe("shouldAutoFallbackToAdmins", () => {
    it("missing_both の場合、true を返すこと", () => {
      const workflow = createMockWorkflow({
        id: "wf-5",
        approvalSteps: [],
        assignedApproverStaffIds: [],
      });

      expect(shouldAutoFallbackToAdmins(workflow)).toBe(true);
    });

    it("missing_approval_steps の場合、true を返すこと", () => {
      const workflow = createMockWorkflow({
        id: "wf-6",
        approvalSteps: [],
        assignedApproverStaffIds: ["staff-1"],
      });

      expect(shouldAutoFallbackToAdmins(workflow)).toBe(true);
    });

    it("有効な承認ステップがある場合、false を返すこと", () => {
      const workflow = createMockWorkflow({
        id: "wf-7",
        approvalSteps: [
          {
            __typename: "ApprovalStep" as const,
            id: "step-1",
            approverStaffId: "staff-1",
            decisionStatus: ApprovalStatus.PENDING,
            approverComment: null,
            decisionTimestamp: null,
            stepOrder: 0,
          },
        ],
      });

      expect(shouldAutoFallbackToAdmins(workflow)).toBe(false);
    });
  });
});
