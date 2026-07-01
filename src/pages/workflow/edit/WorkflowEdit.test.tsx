import { WorkflowStatus } from "@shared/api/graphql/types";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import WorkflowEdit from "./WorkflowEdit";

const mockNavigate = jest.fn();
const mockUpdateWorkflow = jest.fn();
const mockFetchWorkflowById = jest.fn();
const mockBuildDynamicUpdateWorkflowInput = jest.fn();
const mockValidateDynamicWorkflowForm = jest.fn();
const mockExecuteWorkflowWithdraw = jest.fn();
const mockNotify = jest.fn();

const mockLoadedWorkflow = {
  id: "workflow-1",
  staffId: "staff-1",
  status: WorkflowStatus.REJECTED,
  approvalSteps: [],
  assignedApproverStaffIds: [],
  comments: [],
};

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "workflow-1" }),
    useLoaderData: () => ({ workflow: mockLoadedWorkflow }),
  };
});

jest.mock("@entities/staff/model/useStaffs/useStaffs", () => ({
  useStaffs: () => ({
    staffs: [],
  }),
}));

jest.mock("@entities/workflow/model/useWorkflows", () => ({
  __esModule: true,
  default: () => ({
    update: (...args: unknown[]) => mockUpdateWorkflow(...args),
  }),
}));

jest.mock("@shared/lib/useAppNotification", () => ({
  useAppNotification: () => ({
    notify: mockNotify,
  }),
}));

jest.mock("@shared/ui/button", () => ({
  AppButton: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
  AppSplitButton: ({
    options,
    selectedKey,
    onSelectedKeyChange,
    onPrimaryClick,
    disabled,
  }: {
    options: { key: string; label: string; disabled?: boolean }[];
    selectedKey: string | null;
    onSelectedKeyChange: (key: string) => void;
    onPrimaryClick: () => void;
    disabled?: boolean;
  }) => {
    const selected =
      options.find((option) => option.key === selectedKey) ?? options[0] ?? null;
    return (
      <div>
        <select
          aria-label="split-action-select"
          value={selected?.key ?? ""}
          onChange={(event) => onSelectedKeyChange(event.target.value)}
          disabled={disabled}
        >
          {options.map((option) => (
            <option key={option.key} value={option.key} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onPrimaryClick}
          disabled={disabled || selected?.disabled}
        >
          {selected?.label ?? ""}
        </button>
      </div>
    );
  },
}));

jest.mock("@shared/ui/feedback/ConfirmDialog", () => ({
  __esModule: true,
  default: ({
    open,
    title,
    message,
    confirmLabel,
    onConfirm,
    onCancel,
  }: {
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) =>
    open ? (
      <div>
        <p>{title}</p>
        <p>{message}</p>
        <button onClick={onCancel}>キャンセル</button>
        <button onClick={onConfirm}>{confirmLabel}</button>
      </div>
    ) : null,
}));

jest.mock("@/entities/workflow/model/loader", () => ({
  fetchWorkflowById: (...args: unknown[]) => mockFetchWorkflowById(...args),
}));

jest.mock(
  "@/features/workflow/application-form/model/dynamicWorkflowFormModel",
  () => ({
    buildDynamicUpdateWorkflowInput: (...args: unknown[]) =>
      mockBuildDynamicUpdateWorkflowInput(...args),
    validateDynamicWorkflowForm: (...args: unknown[]) =>
      mockValidateDynamicWorkflowForm(...args),
  }),
);

jest.mock(
  "@/features/workflow/application-form/model/DynamicWorkflowFormContext",
  () => ({
    DynamicWorkflowFormProvider: function MockDynamicWorkflowFormProvider({
      children,
    }: {
      children: ReactNode;
    }) {
      return <>{children}</>;
    },
  }),
);

jest.mock("@/features/workflow/hooks/useWorkflowEditLoaderState", () => ({
  useWorkflowEditLoaderState: () => ({
    category: "有給休暇申請",
    setCategory: jest.fn(),
    applicationDate: "2026-03-31",
    fields: {},
    setFieldValue: jest.fn(),
    resetFields: jest.fn(),
    draftMode: false,
    setDraftMode: jest.fn(),
    applicant: {
      familyName: "山田",
      givenName: "太郎",
    },
    existingComments: [],
    setExistingComments: jest.fn(),
    isDirty: false,
  }),
}));

jest.mock(
  "@/features/workflow/application-form/ui/DynamicWorkflowTypeFields",
  () => {
    function MockDynamicWorkflowTypeFields() {
      return <div>workflow-type-fields</div>;
    }
    return MockDynamicWorkflowTypeFields;
  },
);

jest.mock(
  "@/features/workflow/notifications/sendWorkflowSubmissionNotification",
  () => ({
    sendWorkflowSubmissionNotification: jest.fn(),
  }),
);

jest.mock("@features/workflow/lib/workflowWithdraw", () => ({
  executeWorkflowWithdraw: (...args: unknown[]) => mockExecuteWorkflowWithdraw(...args),
}));

// YAML import mock
jest.mock("@features/workflow/config/workflow-types.yaml", () => ({ types: [] }));

describe("WorkflowEdit page layout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateDynamicWorkflowForm.mockReturnValue({
      isValid: true,
      fieldErrors: {},
    });
    mockBuildDynamicUpdateWorkflowInput.mockReturnValue({
      id: "workflow-1",
      status: WorkflowStatus.SUBMITTED,
    });
    mockFetchWorkflowById.mockResolvedValue({
      id: "workflow-1",
      staffId: "staff-1",
      status: WorkflowStatus.REJECTED,
      approvalSteps: [
        {
          __typename: "ApprovalStep",
          id: "step-1",
          approverStaffId: "approver-1",
          decisionStatus: "APPROVED",
          approverComment: null,
          decisionTimestamp: "2026-06-20T00:00:00.000Z",
          stepOrder: 0,
        },
      ],
      assignedApproverStaffIds: ["approver-1"],
      comments: [],
    });
    mockUpdateWorkflow.mockResolvedValue({ id: "workflow-1" });
    mockExecuteWorkflowWithdraw.mockResolvedValue({ id: "workflow-1" });
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: ui,
        },
      ],
      { initialEntries: ["/"] },
    );

    return render(<RouterProvider router={router} />);
  };

  it("renders inside the form width preset", () => {
    const { container } = renderWithRouter(<WorkflowEdit />);

    expect(screen.getByText("申請を編集")).toBeInTheDocument();
    expect(screen.getByText("workflow-type-fields")).toBeInTheDocument();
    expect(
      container.querySelector('div[style*="component-page-widths-form"]'),
    ).toBeTruthy();
  });

  it("却下済み申請の再提出では承認チェーンを初期化して更新する", async () => {
    const user = userEvent.setup();
    renderWithRouter(<WorkflowEdit />);

    await user.click(screen.getByRole("button", { name: "申請" }));

    expect(mockUpdateWorkflow).toHaveBeenCalledTimes(1);
    const payload = mockUpdateWorkflow.mock.calls[0][0] as {
      approvalSteps?: Array<{ decisionStatus?: string }>;
      nextApprovalStepIndex?: number | null;
      approvedStaffIds?: string[];
      rejectedStaffIds?: string[];
      finalDecisionTimestamp?: string | null;
    };
    expect(payload.nextApprovalStepIndex).toBe(0);
    expect(payload.approvedStaffIds).toEqual([]);
    expect(payload.rejectedStaffIds).toEqual([]);
    expect(payload.finalDecisionTimestamp).toBeNull();
    expect(payload.approvalSteps?.[0]?.decisionStatus).toBe("PENDING");
  });

  it("却下済み以外の再提出では承認チェーン初期化を行わない", async () => {
    const user = userEvent.setup();
    mockFetchWorkflowById.mockResolvedValue({
      id: "workflow-1",
      staffId: "staff-1",
      status: WorkflowStatus.PENDING,
      approvalSteps: [
        {
          __typename: "ApprovalStep",
          id: "step-1",
          approverStaffId: "approver-1",
          decisionStatus: "PENDING",
          approverComment: null,
          decisionTimestamp: null,
          stepOrder: 0,
        },
      ],
      assignedApproverStaffIds: ["approver-1"],
      comments: [],
    });

    renderWithRouter(<WorkflowEdit />);
    await user.click(screen.getByRole("button", { name: "申請" }));

    expect(mockUpdateWorkflow).toHaveBeenCalledTimes(1);
    const payload = mockUpdateWorkflow.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.approvedStaffIds).toBeUndefined();
    expect(payload.rejectedStaffIds).toBeUndefined();
    expect(payload.finalDecisionTimestamp).toBeUndefined();
  });

  it("下書きアクションでは下書き保存として更新する", async () => {
    const user = userEvent.setup();
    renderWithRouter(<WorkflowEdit />);

    await user.selectOptions(screen.getByLabelText("split-action-select"), "draft");
    await user.click(screen.getByRole("button", { name: "下書き" }));

    expect(mockBuildDynamicUpdateWorkflowInput).toHaveBeenCalledWith(
      expect.objectContaining({ draftMode: true }),
    );
    expect(mockFetchWorkflowById).not.toHaveBeenCalled();
    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({ title: "下書き保存しました" }),
    );
  });

  it("取り下げアクションでは確認後に取り下げ処理を実行する", async () => {
    const user = userEvent.setup();
    renderWithRouter(<WorkflowEdit />);

    await user.selectOptions(screen.getByLabelText("split-action-select"), "withdraw");
    await user.click(screen.getByRole("button", { name: "取り下げ" }));
    expect(screen.getByText("取り下げ確認")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "取り下げる" }));

    expect(mockExecuteWorkflowWithdraw).toHaveBeenCalledTimes(1);
    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({ title: "取り下げしました" }),
    );
  });
});
