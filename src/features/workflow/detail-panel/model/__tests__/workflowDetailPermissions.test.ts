import { deriveWorkflowDetailPermissions } from "@features/workflow/detail-panel/model/workflowDetailPermissions";
import { WorkflowStatus } from "@shared/api/graphql/types";

describe("deriveWorkflowDetailPermissions", () => {
  it("id があり下書き状態の場合、編集/取り下げを有効にすること", () => {
    const result = deriveWorkflowDetailPermissions({
      id: "wf-1",
      status: WorkflowStatus.DRAFT,
    });
    expect(result.editDisabled).toBe(false);
    expect(result.withdrawDisabled).toBe(false);
    expect(result.isSubmittedOrLater).toBe(false);
    expect(result.isFinalized).toBe(false);
  });

  it("提出後は編集を無効化すること", () => {
    const result = deriveWorkflowDetailPermissions({
      id: "wf-1",
      status: WorkflowStatus.SUBMITTED,
    });
    expect(result.editDisabled).toBe(true);
    expect(result.editTooltip).toBe("提出済み以降の申請は編集できません");
  });

  it("キャンセル済みの場合、取り下げを無効化すること", () => {
    const result = deriveWorkflowDetailPermissions({
      id: "wf-1",
      status: WorkflowStatus.CANCELLED,
    });
    expect(result.withdrawDisabled).toBe(true);
    expect(result.withdrawTooltip).toBe(
      "キャンセル済みのワークフローは取り下げできません"
    );
  });

  it("確定済みの場合、取り下げを無効化すること", () => {
    const result = deriveWorkflowDetailPermissions({
      id: "wf-1",
      status: WorkflowStatus.APPROVED,
    });
    expect(result.withdrawDisabled).toBe(true);
    expect(result.withdrawTooltip).toBe("承認済みの申請は取り下げできません");
  });

  it("id がない場合、すべての操作を無効化すること", () => {
    const result = deriveWorkflowDetailPermissions({ status: null });
    expect(result.editDisabled).toBe(true);
    expect(result.withdrawDisabled).toBe(true);
  });
});
