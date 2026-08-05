import { useWorkflowDetailViewModel } from "@pages/admin/AdminWorkflow/hooks/useWorkflowDetailViewModel";
import { ApprovalStatus, WorkflowStatus } from "@shared/api/graphql/types";
import { renderHook } from "@testing-library/react";

type StaffLike = {
  id: string;
  cognitoUserId?: string | null;
  familyName?: string | null;
  givenName?: string | null;
  approverSetting?: "ADMINS" | "SINGLE" | "MULTIPLE" | null;
  approverSingle?: string | null;
  approverMultiple?: Array<string | null> | null;
  approverMultipleMode?: "ORDER" | "ANY" | null;
};

const makeStaff = (overrides: Partial<StaffLike> = {}): StaffLike => ({
  id: "staff-1",
  cognitoUserId: "cognito-1",
  familyName: "山田",
  givenName: "太郎",
  approverSetting: "ADMINS",
  ...overrides,
});

const makeWorkflow = (overrides: Record<string, unknown> = {}) => ({
  id: "wf-1",
  staffId: "staff-1",
  status: WorkflowStatus.PENDING,
  createdAt: "1700000000000",
  approvalSteps: null,
  ...overrides,
});

describe("useWorkflowDetailViewModel", () => {
  describe("staffName", () => {
    it("workflow が null の場合、em-dash を返すこと", () => {
      const { result } = renderHook(() =>
        useWorkflowDetailViewModel({ workflow: null, staffs: [] }),
      );
      expect(result.current.staffName).toBe("—");
    });

    it("workflow に staffId がない場合、em-dash を返すこと", () => {
      const { result } = renderHook(() =>
        useWorkflowDetailViewModel({
          workflow: makeWorkflow({ staffId: null }) as never,
          staffs: [],
        }),
      );
      expect(result.current.staffName).toBe("—");
    });

    it("スタッフが見つかる場合、スタッフ名を返すこと", () => {
      const { result } = renderHook(() =>
        useWorkflowDetailViewModel({
          workflow: makeWorkflow() as never,
          staffs: [makeStaff()],
        }),
      );
      expect(result.current.staffName).toBe("山田 太郎");
    });

    it("スタッフが見つからない場合、staffId を返すこと", () => {
      const { result } = renderHook(() =>
        useWorkflowDetailViewModel({
          workflow: makeWorkflow() as never,
          staffs: [],
        }),
      );
      expect(result.current.staffName).toBe("staff-1");
    });
  });

  describe("approverInfo — ADMINS mode", () => {
    it("ADMINS 設定の場合、管理者全員を返すこと", () => {
      const { result } = renderHook(() =>
        useWorkflowDetailViewModel({
          workflow: makeWorkflow() as never,
          staffs: [makeStaff({ approverSetting: "ADMINS" })],
        }),
      );
      expect(result.current.approvalSteps[1].name).toBe("管理者全員");
    });

    it("approverSetting が null の場合、管理者全員を返すこと", () => {
      const { result } = renderHook(() =>
        useWorkflowDetailViewModel({
          workflow: makeWorkflow() as never,
          staffs: [makeStaff({ approverSetting: null })],
        }),
      );
      expect(result.current.approvalSteps[1].name).toBe("管理者全員");
    });
  });

  describe("approverInfo — SINGLE mode", () => {
    it("SINGLE モードの場合、承認者名を返すこと", () => {
      const approver = makeStaff({
        id: "approver-1",
        cognitoUserId: "cognito-approver",
        familyName: "佐藤",
        givenName: "花子",
      });
      const { result } = renderHook(() =>
        useWorkflowDetailViewModel({
          workflow: makeWorkflow() as never,
          staffs: [
            makeStaff({
              approverSetting: "SINGLE",
              approverSingle: "cognito-approver",
            }),
            approver,
          ],
        }),
      );
      expect(result.current.approvalSteps[1].name).toBe("佐藤 花子");
    });

    it("approverSingle が未設定の場合、未設定を返すこと", () => {
      const { result } = renderHook(() =>
        useWorkflowDetailViewModel({
          workflow: makeWorkflow() as never,
          staffs: [makeStaff({ approverSetting: "SINGLE", approverSingle: null })],
        }),
      );
      expect(result.current.approvalSteps[1].name).toBe("未設定");
    });
  });

  describe("approverInfo — MULTIPLE mode", () => {
    it("MULTIPLE の ORDER モードの場合、承認者名を順に返すこと", () => {
      const approver1 = makeStaff({
        id: "a1",
        cognitoUserId: "c1",
        familyName: "鈴木",
        givenName: "一郎",
      });
      const approver2 = makeStaff({
        id: "a2",
        cognitoUserId: "c2",
        familyName: "田中",
        givenName: "二郎",
      });
      const { result } = renderHook(() =>
        useWorkflowDetailViewModel({
          workflow: makeWorkflow() as never,
          staffs: [
            makeStaff({
              approverSetting: "MULTIPLE",
              approverMultiple: ["c1", "c2"],
              approverMultipleMode: "ORDER",
            }),
            approver1,
            approver2,
          ],
        }),
      );
      const steps = result.current.approvalSteps;
      expect(steps[1].name).toBe("鈴木 一郎");
      expect(steps[2].name).toBe("田中 二郎");
    });

    it("approverMultiple が空の場合、未設定を返すこと", () => {
      const { result } = renderHook(() =>
        useWorkflowDetailViewModel({
          workflow: makeWorkflow() as never,
          staffs: [
            makeStaff({
              approverSetting: "MULTIPLE",
              approverMultiple: [],
            }),
          ],
        }),
      );
      expect(result.current.approvalSteps[1].name).toBe("未設定");
    });
  });

  describe("approvalSteps — with explicit approvalSteps in workflow", () => {
    it("workflow の approvalSteps 配列からステップを構築すること", () => {
      const workflow = makeWorkflow({
        status: WorkflowStatus.APPROVED,
        approvalSteps: [
          {
            id: "step-1",
            stepOrder: 1,
            approverStaffId: "staff-1",
            decisionStatus: ApprovalStatus.APPROVED,
            decisionTimestamp: "2024-01-01T00:00:00.000Z",
            approverComment: "OK",
          },
        ],
      });
      const { result } = renderHook(() =>
        useWorkflowDetailViewModel({
          workflow: workflow as never,
          staffs: [makeStaff()],
        }),
      );
      const steps = result.current.approvalSteps;
      expect(steps).toHaveLength(2);
      expect(steps[1].state).toBe("承認済み");
      expect(steps[1].comment).toBe("OK");
    });

    it("却下されたステップは却下状態で表示すること", () => {
      const workflow = makeWorkflow({
        approvalSteps: [
          {
            id: "step-1",
            stepOrder: 1,
            approverStaffId: "ADMINS",
            decisionStatus: ApprovalStatus.REJECTED,
            decisionTimestamp: null,
            approverComment: "",
          },
        ],
      });
      const { result } = renderHook(() =>
        useWorkflowDetailViewModel({
          workflow: workflow as never,
          staffs: [],
        }),
      );
      expect(result.current.approvalSteps[1].state).toBe("却下");
      expect(result.current.approvalSteps[1].name).toBe("管理者全員");
    });

    it("スキップされたステップはスキップ状態で表示すること", () => {
      const workflow = makeWorkflow({
        approvalSteps: [
          {
            id: "step-1",
            stepOrder: 1,
            approverStaffId: "staff-1",
            decisionStatus: ApprovalStatus.SKIPPED,
            decisionTimestamp: null,
            approverComment: null,
          },
        ],
      });
      const { result } = renderHook(() =>
        useWorkflowDetailViewModel({
          workflow: workflow as never,
          staffs: [makeStaff()],
        }),
      );
      expect(result.current.approvalSteps[1].state).toBe("スキップ");
    });
  });

  describe("approvalSteps — APPROVED workflow without explicit steps", () => {
    it("明示的なステップがなくても APPROVED の場合は承認済みを表示すること", () => {
      const { result } = renderHook(() =>
        useWorkflowDetailViewModel({
          workflow: makeWorkflow({ status: WorkflowStatus.APPROVED }) as never,
          staffs: [makeStaff({ approverSetting: "ADMINS" })],
        }),
      );
      expect(result.current.approvalSteps[1].state).toBe("承認済み");
    });
  });
});
