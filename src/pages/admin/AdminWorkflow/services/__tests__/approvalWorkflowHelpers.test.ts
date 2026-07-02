import type { GetWorkflowQuery, WorkflowComment } from "@shared/api/graphql/types";
import { ApprovalStatus, WorkflowStatus } from "@shared/api/graphql/types";

import {
  buildApprovalStepInputs,
  canApproveWorkflow,
  canRejectWorkflow,
  createSystemComment,
  hasPendingApprovalStep,
  mapCommentsToInputs,
  resolvePendingApprovalStepIndex,
  resolveWorkflowActionState,
} from "../approvalWorkflowHelpers";

type WorkflowData = NonNullable<GetWorkflowQuery["getWorkflow"]>;

function makeWorkflow(overrides: Partial<WorkflowData> = {}): WorkflowData {
  return {
    id: "wf-1",
    approvalSteps: null,
    assignedApproverStaffIds: null,
    comments: null,
    ...overrides,
  } as WorkflowData;
}

describe("buildApprovalStepInputs", () => {
  it("approvalSteps がある場合はそれを使う", () => {
    const workflow = makeWorkflow({
      approvalSteps: [
        {
          __typename: "ApprovalStep" as const,
          id: "step-1",
          approverStaffId: "approver-1",
          decisionStatus: ApprovalStatus.PENDING,
          approverComment: null,
          decisionTimestamp: null,
          stepOrder: 0,
        },
      ],
    });
    const result = buildApprovalStepInputs(workflow);
    expect(result).toHaveLength(1);
    expect(result[0].approverStaffId).toBe("approver-1");
    expect(result[0].decisionStatus).toBe(ApprovalStatus.PENDING);
  });

  it("approvalSteps がなく assignedApproverStaffIds がある場合はそれを使う", () => {
    const workflow = makeWorkflow({
      approvalSteps: [],
      assignedApproverStaffIds: ["approver-a", "approver-b"],
    });
    const result = buildApprovalStepInputs(workflow);
    expect(result).toHaveLength(2);
    expect(result[0].approverStaffId).toBe("approver-a");
    expect(result[0].stepOrder).toBe(0);
    expect(result[1].approverStaffId).toBe("approver-b");
    expect(result[1].stepOrder).toBe(1);
  });

  it("両方なければフォールバックステップを返す", () => {
    const workflow = makeWorkflow({ approvalSteps: [], assignedApproverStaffIds: [] });
    const result = buildApprovalStepInputs(workflow);
    expect(result).toHaveLength(1);
    expect(result[0].approverStaffId).toBe("ADMINS");
    expect(result[0].decisionStatus).toBe(ApprovalStatus.PENDING);
  });

  it("approvalSteps が null のときもフォールバックを返す", () => {
    const workflow = makeWorkflow({ approvalSteps: null, assignedApproverStaffIds: null });
    const result = buildApprovalStepInputs(workflow);
    expect(result[0].approverStaffId).toBe("ADMINS");
  });
});

describe("resolvePendingApprovalStepIndex", () => {
  const steps = [
    { decisionStatus: ApprovalStatus.APPROVED, approverStaffId: "a", id: "s0", stepOrder: 0, approverComment: null, decisionTimestamp: null },
    { decisionStatus: ApprovalStatus.PENDING, approverStaffId: "b", id: "s1", stepOrder: 1, approverComment: null, decisionTimestamp: null },
    { decisionStatus: ApprovalStatus.PENDING, approverStaffId: "c", id: "s2", stepOrder: 2, approverComment: null, decisionTimestamp: null },
  ];

  it("nextApprovalStepIndex が有効な PENDING ステップを指す場合はそのインデックスを返す", () => {
    expect(resolvePendingApprovalStepIndex(steps, 1)).toBe(1);
  });

  it("nextApprovalStepIndex が範囲外の場合は最初の PENDING ステップを返す", () => {
    expect(resolvePendingApprovalStepIndex(steps, 99)).toBe(1);
  });

  it("nextApprovalStepIndex が null の場合は最初の PENDING ステップを返す", () => {
    expect(resolvePendingApprovalStepIndex(steps, null)).toBe(1);
  });

  it("nextApprovalStepIndex が PENDING でないステップを指す場合は最初の PENDING を探す", () => {
    expect(resolvePendingApprovalStepIndex(steps, 0)).toBe(1);
  });

  it("PENDING ステップがない場合は -1 を返す", () => {
    const allApproved = steps.map((s) => ({ ...s, decisionStatus: ApprovalStatus.APPROVED }));
    expect(resolvePendingApprovalStepIndex(allApproved, null)).toBe(-1);
  });
});

describe("hasPendingApprovalStep", () => {
  it("PENDING ステップがある場合は true", () => {
    const workflow = makeWorkflow({
      approvalSteps: [
        {
          __typename: "ApprovalStep" as const,
          id: "step-1",
          approverStaffId: "approver-1",
          decisionStatus: ApprovalStatus.PENDING,
          approverComment: null,
          decisionTimestamp: null,
          stepOrder: 0,
        },
      ],
      nextApprovalStepIndex: 0,
    });

    expect(hasPendingApprovalStep(workflow)).toBe(true);
  });

  it("PENDING ステップがない場合は false", () => {
    const workflow = makeWorkflow({
      approvalSteps: [
        {
          __typename: "ApprovalStep" as const,
          id: "step-1",
          approverStaffId: "approver-1",
          decisionStatus: ApprovalStatus.APPROVED,
          approverComment: null,
          decisionTimestamp: "2024-01-01T00:00:00.000Z",
          stepOrder: 0,
        },
      ],
      nextApprovalStepIndex: 0,
    });

    expect(hasPendingApprovalStep(workflow)).toBe(false);
  });

  it("PENDING ステップなくても assignedApproverStaffIds があれば true（応急フォールバック）", () => {
    const workflow = makeWorkflow({
      status: WorkflowStatus.SUBMITTED,
      approvalSteps: [],
      assignedApproverStaffIds: ["staff-1"],
      nextApprovalStepIndex: null,
    });

    expect(hasPendingApprovalStep(workflow)).toBe(true);
  });

  it("approvalSteps も assignedApproverStaffIds もない場合は ADMINS フォールバックで true", () => {
    const workflow = makeWorkflow({
      status: WorkflowStatus.SUBMITTED,
      approvalSteps: [],
      assignedApproverStaffIds: [],
      nextApprovalStepIndex: null,
    });

    // buildApprovalStepInputs が ADMINS へフォールバックするので、hasPendingApprovalStep は true
    expect(hasPendingApprovalStep(workflow)).toBe(true);
  });
});

describe("canApproveWorkflow", () => {
  it("PENDING かつ PENDING ステップありなら true", () => {
    const workflow = makeWorkflow({
      status: WorkflowStatus.PENDING,
      approvalSteps: [
        {
          __typename: "ApprovalStep" as const,
          id: "step-1",
          approverStaffId: "approver-1",
          decisionStatus: ApprovalStatus.PENDING,
          approverComment: null,
          decisionTimestamp: null,
          stepOrder: 0,
        },
      ],
      nextApprovalStepIndex: 0,
    });

    expect(canApproveWorkflow(workflow)).toBe(true);
  });

  it("PENDING でも PENDING ステップなしなら false", () => {
    const workflow = makeWorkflow({
      status: WorkflowStatus.PENDING,
      approvalSteps: [
        {
          __typename: "ApprovalStep" as const,
          id: "step-1",
          approverStaffId: "approver-1",
          decisionStatus: ApprovalStatus.APPROVED,
          approverComment: null,
          decisionTimestamp: "2024-01-01T00:00:00.000Z",
          stepOrder: 0,
        },
      ],
      nextApprovalStepIndex: 0,
    });

    expect(canApproveWorkflow(workflow)).toBe(false);
  });

  it("SUBMITTED で assignedApproverStaffIds があれば true（応急フォールバック）", () => {
    const workflow = makeWorkflow({
      status: WorkflowStatus.SUBMITTED,
      approvalSteps: [],
      assignedApproverStaffIds: ["staff-1"],
      nextApprovalStepIndex: null,
    });

    expect(canApproveWorkflow(workflow)).toBe(true);
  });
});

describe("canRejectWorkflow", () => {
  it("APPROVED は差し戻し可能なので true", () => {
    const workflow = makeWorkflow({
      status: WorkflowStatus.APPROVED,
      approvalSteps: [
        {
          __typename: "ApprovalStep" as const,
          id: "step-1",
          approverStaffId: "approver-1",
          decisionStatus: ApprovalStatus.APPROVED,
          approverComment: null,
          decisionTimestamp: "2024-01-01T00:00:00.000Z",
          stepOrder: 0,
        },
      ],
      nextApprovalStepIndex: null,
    });

    expect(canRejectWorkflow(workflow)).toBe(true);
  });

  it("PENDING でも PENDING ステップなしなら false", () => {
    const workflow = makeWorkflow({
      status: WorkflowStatus.PENDING,
      approvalSteps: [
        {
          __typename: "ApprovalStep" as const,
          id: "step-1",
          approverStaffId: "approver-1",
          decisionStatus: ApprovalStatus.APPROVED,
          approverComment: null,
          decisionTimestamp: "2024-01-01T00:00:00.000Z",
          stepOrder: 0,
        },
      ],
      nextApprovalStepIndex: 0,
    });

    expect(canRejectWorkflow(workflow)).toBe(false);
  });

  it("SUBMITTED で assignedApproverStaffIds があれば true（応急フォールバック）", () => {
    const workflow = makeWorkflow({
      status: WorkflowStatus.SUBMITTED,
      approvalSteps: [],
      assignedApproverStaffIds: ["staff-1"],
      nextApprovalStepIndex: null,
    });

    expect(canRejectWorkflow(workflow)).toBe(true);
  });
});

describe("resolveWorkflowActionState", () => {
  it("SUBMITTED で承認者情報がない場合は ADMINS フォールバックで操作可能になる", () => {
    const workflow = makeWorkflow({
      status: WorkflowStatus.SUBMITTED,
      approvalSteps: [],
      assignedApproverStaffIds: [],
      nextApprovalStepIndex: null,
    });

    const result = resolveWorkflowActionState(workflow);

    expect(result.canApprove).toBe(true);
    expect(result.canReject).toBe(true);
    expect(result.warningMessage).toContain("承認者情報が設定されていません");
    expect(result.warningTone).toBe("error");
  });

  it("PENDING だが承認ステップがすべて決裁済みなら操作不可になる", () => {
    const workflow = makeWorkflow({
      status: WorkflowStatus.PENDING,
      approvalSteps: [
        {
          __typename: "ApprovalStep" as const,
          id: "step-1",
          approverStaffId: "approver-1",
          decisionStatus: ApprovalStatus.APPROVED,
          approverComment: null,
          decisionTimestamp: "2024-01-01T00:00:00.000Z",
          stepOrder: 0,
        },
      ],
      nextApprovalStepIndex: 0,
    });

    const result = resolveWorkflowActionState(workflow);

    expect(result.canApprove).toBe(false);
    expect(result.canReject).toBe(false);
    expect(result.warningMessage).toContain("すべての承認ステップが既に処理されています。");
    expect(result.warningTone).toBe("warning");
  });
});

describe("mapCommentsToInputs", () => {
  it("comments が undefined の場合は空配列を返す", () => {
    expect(mapCommentsToInputs(undefined)).toEqual([]);
  });

  it("null エントリをフィルタリングする", () => {
    const comments = [null, { __typename: "WorkflowComment" as const, id: "c1", staffId: "s1", text: "hello", createdAt: "2024-01-01" } as WorkflowComment, null];
    const result = mapCommentsToInputs(comments);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("c1");
  });

  it("全フィールドをマッピングする", () => {
    const comment: WorkflowComment = { __typename: "WorkflowComment", id: "c1", staffId: "s1", text: "hi", createdAt: "2024-01-01" };
    const result = mapCommentsToInputs([comment]);
    expect(result[0]).toEqual({ id: "c1", staffId: "s1", text: "hi", createdAt: "2024-01-01" });
  });
});

describe("createSystemComment", () => {
  it("システムコメントを生成する", () => {
    const comment = createSystemComment("テストメッセージ");
    expect(comment.staffId).toBe("system");
    expect(comment.text).toBe("テストメッセージ");
    expect(comment.id).toMatch(/^c-\d+$/);
    expect(comment.createdAt).toBeDefined();
  });
});
