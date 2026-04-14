import { WorkflowCategory, WorkflowStatus } from "@shared/api/graphql/types";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import WorkflowCarouselDialog from "../WorkflowCarouselDialog";

const mockHandleApprove = jest.fn<Promise<boolean>, []>();
const mockHandleReject = jest.fn<Promise<boolean>, []>();
const mockUseWorkflowDetailData = jest.fn();
const mockUpdateWorkflow = jest.fn();

jest.mock("@app/hooks", () => ({
  useAppDispatchV2: () => jest.fn(),
}));

jest.mock("@entities/attendance/api/attendanceApi", () => ({
  useCreateAttendanceMutation: () => [jest.fn()],
  useLazyGetAttendanceByStaffAndDateQuery: () => [jest.fn()],
  useUpdateAttendanceMutation: () => [jest.fn()],
}));

jest.mock("@entities/staff/model/useStaffs/useStaffs", () => ({
  useStaffs: () => ({
    staffs: [],
    loading: false,
    error: null,
  }),
}));

jest.mock("@entities/workflow/model/useWorkflows", () => ({
  __esModule: true,
  default: () => ({
    update: mockUpdateWorkflow,
  }),
}));

jest.mock("../../hooks/useWorkflowApprovalActions", () => ({
  useWorkflowApprovalActions: () => ({
    handleApprove: mockHandleApprove,
    handleReject: mockHandleReject,
  }),
}));

jest.mock("../../hooks/useWorkflowDetailData", () => ({
  useWorkflowDetailData: (workflowId: string) =>
    mockUseWorkflowDetailData(workflowId),
}));

const createWorkflow = (id: string, createdAt: string) => ({
  __typename: "Workflow" as const,
  id,
  category: WorkflowCategory.OVERTIME,
  staffId: `staff-${id}`,
  status: WorkflowStatus.PENDING,
  comments: [],
  approvalSteps: [],
  createdAt,
  updatedAt: createdAt,
});

describe("WorkflowCarouselDialog", () => {
  const workflowA = createWorkflow("wf-1", "2026-02-20T09:00:00.000Z");
  const workflowB = createWorkflow("wf-2", "2026-02-21T09:00:00.000Z");
  const workflowsById = new Map([
    [workflowA.id, workflowA],
    [workflowB.id, workflowB],
  ]);
  const staffNamesById = new Map([
    [workflowA.staffId, "山田太郎"],
    [workflowB.staffId, "鈴木花子"],
  ]);

  beforeEach(() => {
    jest.clearAllMocks();
    mockHandleApprove.mockResolvedValue(true);
    mockHandleReject.mockResolvedValue(true);
    mockUseWorkflowDetailData.mockImplementation((workflowId: string) => ({
      workflow: workflowsById.get(workflowId),
      setWorkflow: jest.fn(),
    }));
  });

  it("前へ/次へボタンでカルーセル移動できる", () => {
    render(
      <WorkflowCarouselDialog
        open
        onClose={jest.fn()}
        selectedWorkflowId={workflowA.id}
        filteredWorkflowIds={[workflowA.id, workflowB.id]}
        workflowsById={workflowsById}
        staffNamesById={staffNamesById}
        onOpenInRightPanel={jest.fn()}
        enableApprovalActions={false}
      />,
    );

    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "次へ" }));
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "前へ" }));
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("Enterキーで右側で開くを実行し、Escapeで閉じる", () => {
    const onOpenInRightPanel = jest.fn();
    const onClose = jest.fn();

    render(
      <WorkflowCarouselDialog
        open
        onClose={onClose}
        selectedWorkflowId={workflowA.id}
        filteredWorkflowIds={[workflowA.id, workflowB.id]}
        workflowsById={workflowsById}
        staffNamesById={staffNamesById}
        onOpenInRightPanel={onOpenInRightPanel}
        enableApprovalActions={false}
      />,
    );

    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "Enter" });
    expect(onOpenInRightPanel).toHaveBeenCalledWith(workflowB.id);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("承認して次へで成功時に次の申請へ進む", async () => {
    render(
      <WorkflowCarouselDialog
        open
        onClose={jest.fn()}
        selectedWorkflowId={workflowA.id}
        filteredWorkflowIds={[workflowA.id, workflowB.id]}
        workflowsById={workflowsById}
        staffNamesById={staffNamesById}
        onOpenInRightPanel={jest.fn()}
        enableApprovalActions
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "承認して次へ" }));

    await waitFor(() => {
      expect(mockHandleApprove).toHaveBeenCalledTimes(1);
      expect(screen.getByText("2 / 2")).toBeInTheDocument();
    });
  });

  it("yキーで承認して次へを実行できる", async () => {
    render(
      <WorkflowCarouselDialog
        open
        onClose={jest.fn()}
        selectedWorkflowId={workflowA.id}
        filteredWorkflowIds={[workflowA.id, workflowB.id]}
        workflowsById={workflowsById}
        staffNamesById={staffNamesById}
        onOpenInRightPanel={jest.fn()}
        enableApprovalActions
      />,
    );

    fireEvent.keyDown(window, { key: "y" });

    await waitFor(() => {
      expect(mockHandleApprove).toHaveBeenCalledTimes(1);
      expect(screen.getByText("2 / 2")).toBeInTheDocument();
    });
  });

  it("nキーで却下して次へを実行できる", async () => {
    render(
      <WorkflowCarouselDialog
        open
        onClose={jest.fn()}
        selectedWorkflowId={workflowA.id}
        filteredWorkflowIds={[workflowA.id, workflowB.id]}
        workflowsById={workflowsById}
        staffNamesById={staffNamesById}
        onOpenInRightPanel={jest.fn()}
        enableApprovalActions
      />,
    );

    fireEvent.keyDown(window, { key: "n" });

    await waitFor(() => {
      expect(mockHandleReject).toHaveBeenCalledTimes(1);
      expect(screen.getByText("2 / 2")).toBeInTheDocument();
    });
  });

  it("複合アクションが失敗した場合は次へ進まない", async () => {
    mockHandleApprove.mockResolvedValue(false);

    render(
      <WorkflowCarouselDialog
        open
        onClose={jest.fn()}
        selectedWorkflowId={workflowA.id}
        filteredWorkflowIds={[workflowA.id, workflowB.id]}
        workflowsById={workflowsById}
        staffNamesById={staffNamesById}
        onOpenInRightPanel={jest.fn()}
        enableApprovalActions
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "承認して次へ" }));

    await waitFor(() => {
      expect(mockHandleApprove).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.queryByText("確認が完了しました")).not.toBeInTheDocument();
  });

  it("enableApprovalActionsがfalseのときy/nショートカットは反応しない", async () => {
    render(
      <WorkflowCarouselDialog
        open
        onClose={jest.fn()}
        selectedWorkflowId={workflowA.id}
        filteredWorkflowIds={[workflowA.id, workflowB.id]}
        workflowsById={workflowsById}
        staffNamesById={staffNamesById}
        onOpenInRightPanel={jest.fn()}
        enableApprovalActions={false}
      />,
    );

    fireEvent.keyDown(window, { key: "y" });
    fireEvent.keyDown(window, { key: "n" });

    await waitFor(() => {
      expect(mockHandleApprove).not.toHaveBeenCalled();
      expect(mockHandleReject).not.toHaveBeenCalled();
    });
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("最後の申請で却下して次へを押すと完了表示へ切り替わる", async () => {
    render(
      <WorkflowCarouselDialog
        open
        onClose={jest.fn()}
        selectedWorkflowId={workflowB.id}
        filteredWorkflowIds={[workflowA.id, workflowB.id]}
        workflowsById={workflowsById}
        staffNamesById={staffNamesById}
        onOpenInRightPanel={jest.fn()}
        enableApprovalActions
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "却下して次へ" }));

    await waitFor(() => {
      expect(mockHandleReject).toHaveBeenCalledTimes(1);
      expect(screen.getByText("確認が完了しました")).toBeInTheDocument();
    });
    expect(screen.getByText("閉じる")).toBeInTheDocument();
  });

  it("完了表示中はy/nショートカットが無効になる", async () => {
    render(
      <WorkflowCarouselDialog
        open
        onClose={jest.fn()}
        selectedWorkflowId={workflowB.id}
        filteredWorkflowIds={[workflowA.id, workflowB.id]}
        workflowsById={workflowsById}
        staffNamesById={staffNamesById}
        onOpenInRightPanel={jest.fn()}
        enableApprovalActions
      />,
    );

    fireEvent.keyDown(window, { key: "y" });

    await waitFor(() => {
      expect(mockHandleApprove).toHaveBeenCalledTimes(1);
      expect(screen.getByText("確認が完了しました")).toBeInTheDocument();
    });

    fireEvent.keyDown(window, { key: "y" });
    fireEvent.keyDown(window, { key: "n" });

    await waitFor(() => {
      expect(mockHandleApprove).toHaveBeenCalledTimes(1);
      expect(mockHandleReject).not.toHaveBeenCalled();
    });
  });
});
