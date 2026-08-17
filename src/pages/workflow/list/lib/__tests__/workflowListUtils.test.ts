import type { WorkflowListItem } from "@features/workflow/list/workflowListModel";
import { WorkflowStatus } from "@shared/api/graphql/types";

import {
  buildStatusSummary,
  buildWorkflowDetailPath,
  countItemsByStatus,
  getStatusCount,
  isCancelledWorkflow,
  resolveWorkflowKey,
  resolveWorkflowStatusKey,
} from "../workflowListUtils";

const makeItem = (
  overrides: Partial<WorkflowListItem> = {}
): WorkflowListItem => ({
  name: "有給申請",
  category: "休暇申請",
  status: "提出済み",
  rawStatus: WorkflowStatus.SUBMITTED,
  rawId: "wf-1",
  createdAt: "2024-01-01",
  ...overrides,
});

describe("resolveWorkflowStatusKey", () => {
  it("rawStatus が存在する場合、rawStatus を返すこと", () => {
    expect(resolveWorkflowStatusKey(makeItem({ rawStatus: WorkflowStatus.APPROVED }))).toBe(
      WorkflowStatus.APPROVED
    );
  });

  it("rawStatus が存在しない場合、status を返すこと", () => {
    const item = makeItem({ rawStatus: undefined });
    expect(resolveWorkflowStatusKey(item)).toBe("提出済み");
  });

  it("status と rawStatus が両方ない場合、UNKNOWN を返すこと", () => {
    const item = makeItem({ rawStatus: undefined, status: undefined });
    expect(resolveWorkflowStatusKey(item)).toBe("UNKNOWN");
  });
});

describe("isCancelledWorkflow", () => {
  it("rawStatus が CANCELLED の場合、true を返すこと", () => {
    expect(isCancelledWorkflow(makeItem({ rawStatus: WorkflowStatus.CANCELLED }))).toBe(true);
  });

  it("rawStatus が CANCELLED 以外の場合、false を返すこと", () => {
    expect(isCancelledWorkflow(makeItem({ rawStatus: WorkflowStatus.APPROVED }))).toBe(false);
  });
});

describe("countItemsByStatus", () => {
  it("ステータスキーごとに件数を集計すること", () => {
    const items = [
      makeItem({ rawStatus: WorkflowStatus.SUBMITTED }),
      makeItem({ rawStatus: WorkflowStatus.SUBMITTED }),
      makeItem({ rawStatus: WorkflowStatus.APPROVED }),
    ];
    const counts = countItemsByStatus(items);
    expect(counts.get(WorkflowStatus.SUBMITTED)).toBe(2);
    expect(counts.get(WorkflowStatus.APPROVED)).toBe(1);
  });

  it("入力配列が空の場合、空の Map を返すこと", () => {
    expect(countItemsByStatus([])).toEqual(new Map());
  });
});

describe("getStatusCount", () => {
  it("指定したステータスの件数を返すこと", () => {
    const counts = new Map([[WorkflowStatus.SUBMITTED, 3]]);
    expect(getStatusCount(counts, WorkflowStatus.SUBMITTED)).toBe(3);
  });

  it("指定したステータスが存在しない場合、0 を返すこと", () => {
    expect(getStatusCount(new Map(), WorkflowStatus.APPROVED)).toBe(0);
  });
});

describe("buildStatusSummary", () => {
  it("合計件数と内訳件数を正しく返すこと", () => {
    const items = [
      makeItem({ rawStatus: WorkflowStatus.DRAFT }),
      makeItem({ rawStatus: WorkflowStatus.SUBMITTED }),
      makeItem({ rawStatus: WorkflowStatus.SUBMITTED }),
      makeItem({ rawStatus: WorkflowStatus.APPROVED }),
    ];
    const summary = buildStatusSummary(items);
    expect(summary.total).toBe(4);
    expect(summary.draft).toBe(1);
    expect(summary.pending).toBe(2);
    expect(summary.approved).toBe(1);
  });

  it("入力リストが空の場合、すべて 0 を返すこと", () => {
    const summary = buildStatusSummary([]);
    expect(summary).toEqual({ total: 0, draft: 0, pending: 0, approved: 0 });
  });
});

describe("resolveWorkflowKey", () => {
  it("rawId が存在する場合、rawId をキーとして返すこと", () => {
    expect(resolveWorkflowKey(makeItem({ rawId: "wf-42" }))).toBe("wf-42");
  });

  it("rawId が存在しない場合、name-createdAt をキーとして返すこと", () => {
    const item = makeItem({ rawId: undefined, name: "申請", createdAt: "2024-03-01" });
    expect(resolveWorkflowKey(item)).toBe("申請-2024-03-01");
  });
});

describe("buildWorkflowDetailPath", () => {
  it("rawId を含む詳細パスを生成すること", () => {
    const item = makeItem({ rawId: "wf-1" });
    expect(buildWorkflowDetailPath(item)).toBe("/workflow/wf-1");
  });

  it("キーに特殊文字が含まれる場合でも詳細パスを生成すること", () => {
    const item = makeItem({ rawId: undefined, name: "有給申請", createdAt: "2024-01-01" });
    expect(buildWorkflowDetailPath(item)).toContain("/workflow/");
  });
});
