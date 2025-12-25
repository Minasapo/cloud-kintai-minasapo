import { deriveWorkflowDetailPermissions } from "@features/workflow/detail-panel/model/workflowDetailPermissions";
import { WorkflowStatus } from "@shared/api/graphql/types";

describe("deriveWorkflowDetailPermissions", () => {
  it("enables edit/withdraw when draft with id", () => {
    const result = deriveWorkflowDetailPermissions({
      id: "wf-1",
      status: WorkflowStatus.DRAFT,
    });
    expect(result.editDisabled).toBe(false);
    expect(result.withdrawDisabled).toBe(false);
    expect(result.isSubmittedOrLater).toBe(false);
    expect(result.isFinalized).toBe(false);
  });

  it("disables edit after submission", () => {
    const result = deriveWorkflowDetailPermissions({
      id: "wf-1",
      status: WorkflowStatus.SUBMITTED,
    });
    expect(result.editDisabled).toBe(true);
    expect(result.editTooltip).toBe("提出済み以降の申請は編集できません");
  });

  it("disables withdraw when cancelled", () => {
    const result = deriveWorkflowDetailPermissions({
      id: "wf-1",
      status: WorkflowStatus.CANCELLED,
    });
    expect(result.withdrawDisabled).toBe(true);
    expect(result.withdrawTooltip).toBe(
      "キャンセル済みのワークフローは取り下げできません"
    );
  });

  it("disables withdraw when finalized", () => {
    const result = deriveWorkflowDetailPermissions({
      id: "wf-1",
      status: WorkflowStatus.APPROVED,
    });
    expect(result.withdrawDisabled).toBe(true);
    expect(result.withdrawTooltip).toBe("承認済みの申請は取り下げできません");
  });

  it("disables all actions when id missing", () => {
    const result = deriveWorkflowDetailPermissions({ status: null });
    expect(result.editDisabled).toBe(true);
    expect(result.withdrawDisabled).toBe(true);
  });
});
