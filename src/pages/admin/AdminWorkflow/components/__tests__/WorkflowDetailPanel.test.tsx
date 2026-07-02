import { AuthContext } from "@app/providers/auth/AuthContext";
import { AppConfigContext } from "@entities/app-config/model/AppConfigContext";
import {
  ApprovalStatus,
  WorkflowCategory,
  WorkflowStatus,
} from "@shared/api/graphql/types";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import WorkflowDetailPanel from "../WorkflowDetailPanel";

// ── mock declarations ────────────────────────────────────────────────────────

const mockHandleApprove = jest.fn();
const mockHandleReject = jest.fn();
const mockSetWorkflow = jest.fn();
const mockUpdateWorkflow = jest.fn();
const mockUseWorkflowDetailData = jest.fn();
const mockUseWorkflowDetailViewModel = jest.fn();
const mockDispatch = jest.fn();

jest.mock("@app/hooks", () => ({
  useAppDispatchV2: () => mockDispatch,
}));

jest.mock("@entities/attendance/api/attendanceApi", () => ({
  useCreateAttendanceMutation: () => [jest.fn()],
  useLazyGetAttendanceByStaffAndDateQuery: () => [jest.fn()],
  useUpdateAttendanceMutation: () => [jest.fn()],
}));

jest.mock("@entities/staff/model/useStaffs/useStaffs", () => ({
  useStaffs: () => ({ staffs: [], loading: false, error: null }),
}));

jest.mock("@entities/workflow/model/useWorkflows", () => ({
  __esModule: true,
  default: () => ({ update: mockUpdateWorkflow }),
}));

jest.mock("../../hooks/useWorkflowApprovalActions", () => ({
  useWorkflowApprovalActions: () => ({
    handleApprove: mockHandleApprove,
    handleReject: mockHandleReject,
  }),
}));

jest.mock("../../hooks/useWorkflowDetailData", () => ({
  useWorkflowDetailData: (...args: unknown[]) =>
    mockUseWorkflowDetailData(...args),
}));

jest.mock("../../hooks/useWorkflowDetailViewModel", () => ({
  useWorkflowDetailViewModel: (...args: unknown[]) =>
    mockUseWorkflowDetailViewModel(...args),
}));

// WorkflowCommentSection スタブ
jest.mock("../WorkflowCommentSection", () => ({
  __esModule: true,
  default: () =>
    React.createElement("div", { "data-testid": "comment-section" }),
}));

// WorkflowMetadataPanelBase スタブ
jest.mock("@features/workflow/detail-panel/ui/WorkflowMetadataPanel", () => ({
  WorkflowMetadataPanelBase: () =>
    React.createElement("div", { "data-testid": "metadata-panel" }),
}));

jest.mock("@shared/lib/logger", () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

jest.mock("@shared/lib/useAppNotification", () => ({
  useAppNotification: () => ({ notify: jest.fn() }),
}));

jest.mock("@shared/lib/store/notificationSlice", () => ({
  pushNotification: jest.fn((payload) => ({
    type: "notification/push",
    payload,
  })),
}));

jest.mock("@entities/workflow/lib/workflowLabels", () => ({
  getWorkflowCategoryLabel: jest.fn(() => "有給休暇申請"),
  STATUS_LABELS: {
    PENDING: "承認待ち",
    APPROVED: "承認済み",
    REJECTED: "却下",
    CANCELLED: "キャンセル",
    DRAFT: "下書き",
    SUBMITTED: "提出済み",
  },
}));

// SectionTitle / SubsectionTitle スタブ
jest.mock("@shared/ui/typography", () => ({
  SectionTitle: ({
    children,
    ...rest
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement("h2", rest, children),
  SubsectionTitle: ({
    children,
    ...rest
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement("h3", rest, children),
}));

// ── helpers ──────────────────────────────────────────────────────────────────

const makeWorkflow = (overrides: Record<string, unknown> = {}) => ({
  __typename: "Workflow" as const,
  id: "wf-1",
  staffId: "staff-1",
  status: WorkflowStatus.PENDING,
  category: WorkflowCategory.PAID_LEAVE,
  comments: [],
  approvalSteps: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

const makeAuthContextValue = (overrides: Record<string, unknown> = {}) => ({
  cognitoUser: { id: "cognito-1", familyName: "山田", givenName: "太郎" },
  authStatus: "authenticated" as const,
  signOut: jest.fn(),
  signIn: jest.fn(),
  isCognitoUserRole: jest.fn(() => false),
  ...overrides,
});

const makeAppConfigContextValue = () => ({
  getStartTime: jest.fn(() => "09:00"),
  getEndTime: jest.fn(() => "18:00"),
  getLunchRestStartTime: jest.fn(() => "12:00"),
  getLunchRestEndTime: jest.fn(() => "13:00"),
});

/** テスト用ラッパー */
function renderPanel(
  props: Partial<Parameters<typeof WorkflowDetailPanel>[0]> = {},
  contextOverrides: Record<string, unknown> = {},
) {
  const authValue = makeAuthContextValue(contextOverrides);
  const appConfigValue = makeAppConfigContextValue();

  return render(
    React.createElement(
      AuthContext.Provider,
      { value: authValue as never },
      React.createElement(
        AppConfigContext.Provider,
        { value: appConfigValue as never },
        React.createElement(WorkflowDetailPanel, {
          workflowId: "wf-1",
          ...props,
        }),
      ),
    ),
  );
}

// ── tests ────────────────────────────────────────────────────────────────────

describe("WorkflowDetailPanel", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockUpdateWorkflow.mockResolvedValue(makeWorkflow());

    // デフォルト: ロード完了・ワークフローあり
    mockUseWorkflowDetailData.mockReturnValue({
      workflow: makeWorkflow(),
      setWorkflow: mockSetWorkflow,
      loading: false,
      error: null,
    });

    mockUseWorkflowDetailViewModel.mockReturnValue({
      staffName: "山田 太郎",
      applicationDate: "2024/01/01",
      approvalSteps: [
        {
          id: "s0",
          name: "山田 太郎",
          role: "申請者",
          state: "",
          date: "2024/01/01",
          comment: "",
        },
      ],
    });
  });

  describe("ローディング状態", () => {
    it("loading が true の場合は「読み込み中...」が表示される", () => {
      mockUseWorkflowDetailData.mockReturnValue({
        workflow: null,
        setWorkflow: mockSetWorkflow,
        loading: true,
        error: null,
      });

      renderPanel();
      expect(screen.getByText("読み込み中...")).toBeInTheDocument();
    });

    it("loading が true の場合はメタデータパネルが表示されない", () => {
      mockUseWorkflowDetailData.mockReturnValue({
        workflow: null,
        setWorkflow: mockSetWorkflow,
        loading: true,
        error: null,
      });

      renderPanel();
      expect(screen.queryByTestId("metadata-panel")).not.toBeInTheDocument();
    });
  });

  describe("エラー状態", () => {
    it("error がある場合はエラーメッセージが表示される", () => {
      mockUseWorkflowDetailData.mockReturnValue({
        workflow: null,
        setWorkflow: mockSetWorkflow,
        loading: false,
        error: "ワークフローが見つかりません",
      });

      renderPanel();
      expect(
        screen.getByText("ワークフローが見つかりません"),
      ).toBeInTheDocument();
    });

    it("error がある場合はメタデータパネルが表示されない", () => {
      mockUseWorkflowDetailData.mockReturnValue({
        workflow: null,
        setWorkflow: mockSetWorkflow,
        loading: false,
        error: "エラー",
      });

      renderPanel();
      expect(screen.queryByTestId("metadata-panel")).not.toBeInTheDocument();
    });
  });

  describe("正常状態", () => {
    it("ワークフロー情報が正常にレンダリングされる", () => {
      renderPanel();
      expect(screen.getByText("申請内容の確認")).toBeInTheDocument();
    });

    it("メタデータパネルが表示される", () => {
      renderPanel();
      expect(screen.getByTestId("metadata-panel")).toBeInTheDocument();
    });

    it("コメントセクションが表示される", () => {
      renderPanel();
      expect(screen.getByTestId("comment-section")).toBeInTheDocument();
    });

    it("サマリーカード見出しは表示されない", () => {
      renderPanel();
      expect(screen.queryByText("現在ステータス")).not.toBeInTheDocument();
      expect(screen.queryByText("承認ステップ")).not.toBeInTheDocument();
      expect(screen.queryByText("コメント件数")).not.toBeInTheDocument();
    });
  });

  describe("戻るボタン", () => {
    it("showBackButton=true かつ onBack が渡されている場合に表示される", () => {
      const onBack = jest.fn();
      renderPanel({ showBackButton: true, onBack });
      expect(
        screen.getByRole("button", { name: /ワークフロー一覧へ戻る/ }),
      ).toBeInTheDocument();
    });

    it("showBackButton=false の場合は表示されない", () => {
      renderPanel({ showBackButton: false, onBack: jest.fn() });
      expect(
        screen.queryByRole("button", { name: /ワークフロー一覧へ戻る/ }),
      ).not.toBeInTheDocument();
    });

    it("onBack が未指定の場合は表示されない", () => {
      renderPanel({ showBackButton: true });
      expect(
        screen.queryByRole("button", { name: /ワークフロー一覧へ戻る/ }),
      ).not.toBeInTheDocument();
    });

    it("戻るボタンをクリックすると onBack が呼ばれる", async () => {
      const user = userEvent.setup();
      const onBack = jest.fn();
      renderPanel({ showBackButton: true, onBack });

      await user.click(
        screen.getByRole("button", { name: /ワークフロー一覧へ戻る/ }),
      );
      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("承認ボタン", () => {
    it("承認ボタンが表示される", () => {
      renderPanel();
      expect(screen.getByRole("button", { name: "承認" })).toBeInTheDocument();
    });

    it("ステータスが APPROVED の場合は承認ボタンが無効化される", () => {
      mockUseWorkflowDetailData.mockReturnValue({
        workflow: makeWorkflow({ status: WorkflowStatus.APPROVED }),
        setWorkflow: mockSetWorkflow,
        loading: false,
        error: null,
      });

      renderPanel();
      expect(screen.getByRole("button", { name: "承認" })).toBeDisabled();
    });

    it("ステータスが CANCELLED の場合は承認ボタンが無効化される", () => {
      mockUseWorkflowDetailData.mockReturnValue({
        workflow: makeWorkflow({ status: WorkflowStatus.CANCELLED }),
        setWorkflow: mockSetWorkflow,
        loading: false,
        error: null,
      });

      renderPanel();
      expect(screen.getByRole("button", { name: "承認" })).toBeDisabled();
    });

    it("ステータスが REJECTED の場合は承認アクションが実行できない", async () => {
      const user = userEvent.setup();
      mockUseWorkflowDetailData.mockReturnValue({
        workflow: makeWorkflow({ status: WorkflowStatus.REJECTED }),
        setWorkflow: mockSetWorkflow,
        loading: false,
        error: null,
      });

      renderPanel();
      expect(
        screen.queryByRole("button", { name: "承認" }),
      ).not.toBeInTheDocument();

      await user.click(
        screen.getByRole("button", { name: "select preset action" }),
      );
      expect(screen.getByRole("menuitem", { name: "承認" })).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    });

    it("ステータスが PENDING の場合は承認ボタンが有効", () => {
      renderPanel();
      expect(screen.getByRole("button", { name: "承認" })).not.toBeDisabled();
    });

    it("PENDING でも承認対象ステップがない場合は承認ボタンが無効", () => {
      mockUseWorkflowDetailData.mockReturnValue({
        workflow: makeWorkflow({
          status: WorkflowStatus.PENDING,
          approvalSteps: [
            {
              __typename: "ApprovalStep",
              id: "step-1",
              approverStaffId: "approver-1",
              decisionStatus: ApprovalStatus.APPROVED,
              approverComment: null,
              decisionTimestamp: "2024-01-01T00:00:00.000Z",
              stepOrder: 0,
            },
          ],
          nextApprovalStepIndex: 0,
        }),
        setWorkflow: mockSetWorkflow,
        loading: false,
        error: null,
      });

      renderPanel();
      expect(screen.getByRole("button", { name: "承認" })).toBeDisabled();
    });

    it("承認ボタンをクリックすると handleApprove が呼ばれる", async () => {
      const user = userEvent.setup();
      renderPanel();

      await user.click(screen.getByRole("button", { name: "承認" }));
      expect(mockHandleApprove).toHaveBeenCalledTimes(1);
    });

    it("workflow が存在しない場合は承認ボタンが無効化される", () => {
      mockUseWorkflowDetailData.mockReturnValue({
        workflow: null,
        setWorkflow: mockSetWorkflow,
        loading: false,
        error: null,
      });

      renderPanel();
      expect(screen.getByRole("button", { name: "承認" })).toBeDisabled();
    });
  });

  describe("却下ボタン", () => {
    it("却下アクションがメニューに表示される", async () => {
      const user = userEvent.setup();
      renderPanel();
      await user.click(
        screen.getByRole("button", { name: "select preset action" }),
      );
      expect(
        screen.getByRole("menuitem", { name: "却下" }),
      ).toBeInTheDocument();
    });

    it("ステータスが REJECTED の場合は却下アクションが無効化される", async () => {
      const user = userEvent.setup();
      mockUseWorkflowDetailData.mockReturnValue({
        workflow: makeWorkflow({ status: WorkflowStatus.REJECTED }),
        setWorkflow: mockSetWorkflow,
        loading: false,
        error: null,
      });

      renderPanel();
      await user.click(
        screen.getByRole("button", { name: "select preset action" }),
      );
      expect(screen.getByRole("menuitem", { name: "却下" })).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    });

    it("ステータスが CANCELLED の場合は却下アクションが無効化される", async () => {
      const user = userEvent.setup();
      mockUseWorkflowDetailData.mockReturnValue({
        workflow: makeWorkflow({ status: WorkflowStatus.CANCELLED }),
        setWorkflow: mockSetWorkflow,
        loading: false,
        error: null,
      });

      renderPanel();
      await user.click(
        screen.getByRole("button", { name: "select preset action" }),
      );
      expect(screen.getByRole("menuitem", { name: "却下" })).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    });

    it("ステータスが PENDING の場合は却下アクションが有効", async () => {
      const user = userEvent.setup();
      renderPanel();
      await user.click(
        screen.getByRole("button", { name: "select preset action" }),
      );
      expect(
        screen.getByRole("menuitem", { name: "却下" }),
      ).not.toHaveAttribute("aria-disabled", "true");
    });

    it("PENDING でも却下対象ステップがない場合は却下アクションが無効", async () => {
      const user = userEvent.setup();
      mockUseWorkflowDetailData.mockReturnValue({
        workflow: makeWorkflow({
          status: WorkflowStatus.PENDING,
          approvalSteps: [
            {
              __typename: "ApprovalStep",
              id: "step-1",
              approverStaffId: "approver-1",
              decisionStatus: ApprovalStatus.APPROVED,
              approverComment: null,
              decisionTimestamp: "2024-01-01T00:00:00.000Z",
              stepOrder: 0,
            },
          ],
          nextApprovalStepIndex: 0,
        }),
        setWorkflow: mockSetWorkflow,
        loading: false,
        error: null,
      });

      renderPanel();
      await user.click(
        screen.getByRole("button", { name: "select preset action" }),
      );
      expect(screen.getByRole("menuitem", { name: "却下" })).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    });

    it("不整合データでは修復アクションが表示される", async () => {
      const user = userEvent.setup();
      mockUseWorkflowDetailData.mockReturnValue({
        workflow: makeWorkflow({
          status: WorkflowStatus.SUBMITTED,
          approvalSteps: [],
          assignedApproverStaffIds: [],
        }),
        setWorkflow: mockSetWorkflow,
        loading: false,
        error: null,
      });

      renderPanel();
      await user.click(
        screen.getByRole("button", { name: "select preset action" }),
      );
      expect(
        screen.getByRole("menuitem", { name: "データを自動修復" }),
      ).toBeInTheDocument();
    });

    it("不整合データでも初期表示で修復アクションは自動選択されない", async () => {
      const user = userEvent.setup();
      mockUseWorkflowDetailData.mockReturnValue({
        workflow: makeWorkflow({
          status: WorkflowStatus.SUBMITTED,
          approvalSteps: [],
          assignedApproverStaffIds: [],
        }),
        setWorkflow: mockSetWorkflow,
        loading: false,
        error: null,
      });

      renderPanel();

      expect(
        screen.queryByRole("button", { name: "データを自動修復" }),
      ).not.toBeInTheDocument();

      await user.click(
        screen.getByRole("button", { name: "select preset action" }),
      );
      expect(
        screen.getByRole("menuitem", { name: "データを自動修復" }),
      ).toBeInTheDocument();
    });

    it("修復ボタンを押すと承認チェーンの修復更新が呼ばれる", async () => {
      const user = userEvent.setup();
      mockUseWorkflowDetailData.mockReturnValue({
        workflow: makeWorkflow({
          status: WorkflowStatus.SUBMITTED,
          approvalSteps: [],
          assignedApproverStaffIds: [],
        }),
        setWorkflow: mockSetWorkflow,
        loading: false,
        error: null,
      });

      renderPanel();

      await user.click(
        screen.getByRole("button", { name: "select preset action" }),
      );
      await user.click(
        screen.getByRole("menuitem", { name: "データを自動修復" }),
      );

      await user.click(
        screen.getByRole("button", { name: "データを自動修復" }),
      );

      expect(mockUpdateWorkflow).toHaveBeenCalledTimes(1);
      const payload = mockUpdateWorkflow.mock.calls[0][0] as {
        approvalSteps?: Array<{
          approverStaffId?: string;
          decisionStatus?: string;
        }>;
        status?: string;
        nextApprovalStepIndex?: number | null;
      };
      expect(payload.status).toBe(WorkflowStatus.SUBMITTED);
      expect(payload.nextApprovalStepIndex).toBe(0);
      expect(payload.approvalSteps?.[0]?.approverStaffId).toBe("ADMINS");
      expect(payload.approvalSteps?.[0]?.decisionStatus).toBe("PENDING");
    });

    it("ステータスが APPROVED の場合は差し戻しのため却下ボタンが有効", async () => {
      const user = userEvent.setup();
      mockUseWorkflowDetailData.mockReturnValue({
        workflow: makeWorkflow({ status: WorkflowStatus.APPROVED }),
        setWorkflow: mockSetWorkflow,
        loading: false,
        error: null,
      });

      renderPanel();

      await user.click(
        screen.getByRole("button", { name: "select preset action" }),
      );
      expect(
        screen.getByRole("menuitem", { name: "却下" }),
      ).not.toHaveAttribute("aria-disabled", "true");
    });

    it("却下ボタンをクリックすると handleReject が呼ばれる", async () => {
      const user = userEvent.setup();
      renderPanel();

      await user.click(
        screen.getByRole("button", { name: "select preset action" }),
      );
      await user.click(screen.getByRole("menuitem", { name: "却下" }));
      await user.click(screen.getByRole("button", { name: "却下" }));
      expect(mockHandleReject).toHaveBeenCalledTimes(1);
    });
  });

  describe("useWorkflowDetailData への引数", () => {
    it("workflowId が渡される", () => {
      renderPanel({ workflowId: "wf-custom" });
      expect(mockUseWorkflowDetailData).toHaveBeenCalledWith(
        "wf-custom",
        expect.anything(),
      );
    });

    it("workflowId が undefined の場合は undefined が渡される", () => {
      renderPanel({ workflowId: undefined });
      expect(mockUseWorkflowDetailData).toHaveBeenCalledWith(
        undefined,
        expect.anything(),
      );
    });
  });
});
