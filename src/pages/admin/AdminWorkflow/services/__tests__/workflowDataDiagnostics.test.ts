import { ApprovalStatus,WorkflowStatus } from "@shared/api/graphql/types";
import { createMockWorkflow } from "@shared/test-utils";

import {
  diagnoseWorkflowData,
  shouldAutoFallbackToAdmins,
} from "../workflowDataDiagnostics";

describe("workflowDataDiagnostics", () => {
  describe("diagnoseWorkflowData", () => {
    it("should detect missing_both when approvalSteps and assignedApproverStaffIds are empty", () => {
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

    it("should detect missing_approval_steps when approvalSteps is empty but assignedApproverStaffIds is not", () => {
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

    it("should detect all_steps_decided when all steps have decisions and final state is inconsistent", () => {
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

    it("should detect none when all steps decided and final state is already consistent", () => {
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

    it("should detect none when workflow data is valid", () => {
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
    it("should return true for missing_both", () => {
      const workflow = createMockWorkflow({
        id: "wf-5",
        approvalSteps: [],
        assignedApproverStaffIds: [],
      });

      expect(shouldAutoFallbackToAdmins(workflow)).toBe(true);
    });

    it("should return true for missing_approval_steps", () => {
      const workflow = createMockWorkflow({
        id: "wf-6",
        approvalSteps: [],
        assignedApproverStaffIds: ["staff-1"],
      });

      expect(shouldAutoFallbackToAdmins(workflow)).toBe(true);
    });

    it("should return false for valid approval steps", () => {
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
