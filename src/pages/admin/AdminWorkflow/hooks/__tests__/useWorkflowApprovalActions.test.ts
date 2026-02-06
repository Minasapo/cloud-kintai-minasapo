import {
  ApprovalStatus,
  ApproverMultipleMode,
  GetWorkflowQuery,
  UpdateWorkflowInput,
  WorkflowCategory,
  WorkflowStatus,
} from "@shared/api/graphql/types";
import { act, renderHook } from "@testing-library/react";
import dayjs from "dayjs";

import {
  processClockCorrectionApprovalAttendance,
  processPaidLeaveApprovalAttendance,
  WorkflowApprovalUserError,
} from "../../services/workflowApprovalAttendanceService";
import { useWorkflowApprovalActions } from "../useWorkflowApprovalActions";

const createOperationLogDataMock = jest.fn();

jest.mock("@entities/operation-log/model/createOperationLogData", () => ({
  __esModule: true,
  default: (...args: unknown[]) => createOperationLogDataMock(...args),
}));

jest.mock("../../services/workflowApprovalAttendanceService", () => {
  const actual = jest.requireActual(
    "../../services/workflowApprovalAttendanceService"
  );
  return {
    ...actual,
    processPaidLeaveApprovalAttendance: jest.fn(),
    processClockCorrectionApprovalAttendance: jest.fn(),
  };
});

type WorkflowData = NonNullable<GetWorkflowQuery["getWorkflow"]>;

const processPaidLeaveMock = processPaidLeaveApprovalAttendance as jest.Mock;
const processClockCorrectionMock =
  processClockCorrectionApprovalAttendance as jest.Mock;

const createWorkflow = (
  overrides: Partial<WorkflowData> = {}
): WorkflowData => ({
  __typename: "Workflow",
  id: "workflow-1",
  approvedStaffIds: [],
  rejectedStaffIds: [],
  finalDecisionTimestamp: null,
  category: WorkflowCategory.CUSTOM,
  staffId: "staff-1",
  status: WorkflowStatus.PENDING,
  assignedApproverStaffIds: ["approver-1"],
  approvalSteps: [
    {
      __typename: "ApprovalStep",
      id: "step-1",
      approverStaffId: "approver-1",
      decisionStatus: ApprovalStatus.PENDING,
      approverComment: null,
      decisionTimestamp: null,
      stepOrder: 0,
    },
  ],
  nextApprovalStepIndex: 0,
  submitterApproverSetting: null,
  submitterApproverId: null,
  submitterApproverIds: null,
  submitterApproverMultipleMode: ApproverMultipleMode.ANY,
  overTimeDetails: {
    __typename: "OverTimeWorkflow",
    date: "2026-02-01",
    startTime: "09:00",
    endTime: "18:00",
    reason: "",
  },
  comments: [],
  createdAt: "2026-02-01T00:00:00.000Z",
  updatedAt: "2026-02-01T00:00:00.000Z",
  ...overrides,
});

describe("useWorkflowApprovalActions", () => {
  const updateWorkflow = jest.fn<Promise<WorkflowData>, [UpdateWorkflowInput]>();
  const setWorkflow = jest.fn<void, [WorkflowData]>();
  const notifySuccess = jest.fn<void, [string]>();
  const notifyError = jest.fn<void, [string]>();
  const getAttendanceByStaffAndDate = jest.fn(() => ({
    unwrap: jest.fn(),
  }));
  const createAttendance = jest.fn(() => ({ unwrap: jest.fn() }));
  const updateAttendance = jest.fn(() => ({ unwrap: jest.fn() }));
  const staffs = [
    {
      id: "approver-staff-id",
      cognitoUserId: "cognito-approver-id",
      familyName: "承認",
      givenName: "者",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "confirm").mockReturnValue(true);
    processPaidLeaveMock.mockResolvedValue({ kind: "updated" });
    processClockCorrectionMock.mockResolvedValue({ kind: "updated" });
    createOperationLogDataMock.mockResolvedValue(undefined);
  });

  it("承認時にworkflowを更新し成功通知を出す", async () => {
    const workflow = createWorkflow();
    updateWorkflow.mockResolvedValue(
      createWorkflow({ status: WorkflowStatus.APPROVED })
    );

    const { result } = renderHook(() =>
      useWorkflowApprovalActions({
        workflow,
        cognitoUser: { id: "cognito-approver-id" },
        staffs,
        updateWorkflow,
        setWorkflow,
        notifySuccess,
        notifyError,
        getStartTime: () => dayjs("2026-02-01T09:00:00"),
        getEndTime: () => dayjs("2026-02-01T18:00:00"),
        getLunchRestStartTime: () => dayjs("2026-02-01T12:00:00"),
        getLunchRestEndTime: () => dayjs("2026-02-01T13:00:00"),
        getAttendanceByStaffAndDate,
        createAttendance,
        updateAttendance,
      })
    );

    await act(async () => {
      await result.current.handleApprove();
    });

    expect(updateWorkflow).toHaveBeenCalledTimes(1);
    expect(setWorkflow).toHaveBeenCalledTimes(1);
    expect(notifySuccess).toHaveBeenCalledWith("承認しました");
    expect(notifyError).not.toHaveBeenCalled();
  });

  it("却下時にworkflowを更新し成功通知を出す", async () => {
    const workflow = createWorkflow();
    updateWorkflow.mockResolvedValue(
      createWorkflow({ status: WorkflowStatus.REJECTED })
    );

    const { result } = renderHook(() =>
      useWorkflowApprovalActions({
        workflow,
        cognitoUser: { id: "cognito-approver-id" },
        staffs,
        updateWorkflow,
        setWorkflow,
        notifySuccess,
        notifyError,
        getStartTime: () => dayjs("2026-02-01T09:00:00"),
        getEndTime: () => dayjs("2026-02-01T18:00:00"),
        getLunchRestStartTime: () => dayjs("2026-02-01T12:00:00"),
        getLunchRestEndTime: () => dayjs("2026-02-01T13:00:00"),
        getAttendanceByStaffAndDate,
        createAttendance,
        updateAttendance,
      })
    );

    await act(async () => {
      await result.current.handleReject();
    });

    expect(updateWorkflow).toHaveBeenCalledTimes(1);
    expect(setWorkflow).toHaveBeenCalledTimes(1);
    expect(notifySuccess).toHaveBeenCalledWith("却下しました");
    expect(notifyError).not.toHaveBeenCalled();
  });

  it("打刻修正のユーザーエラー時はエラー通知して承認成功通知しない", async () => {
    const workflow = createWorkflow({
      category: WorkflowCategory.CLOCK_CORRECTION,
    });
    updateWorkflow.mockResolvedValue(
      createWorkflow({
        category: WorkflowCategory.CLOCK_CORRECTION,
        status: WorkflowStatus.APPROVED,
      })
    );
    processClockCorrectionMock.mockRejectedValue(
      new WorkflowApprovalUserError("入力エラー")
    );

    const { result } = renderHook(() =>
      useWorkflowApprovalActions({
        workflow,
        cognitoUser: { id: "cognito-approver-id" },
        staffs,
        updateWorkflow,
        setWorkflow,
        notifySuccess,
        notifyError,
        getStartTime: () => dayjs("2026-02-01T09:00:00"),
        getEndTime: () => dayjs("2026-02-01T18:00:00"),
        getLunchRestStartTime: () => dayjs("2026-02-01T12:00:00"),
        getLunchRestEndTime: () => dayjs("2026-02-01T13:00:00"),
        getAttendanceByStaffAndDate,
        createAttendance,
        updateAttendance,
      })
    );

    await act(async () => {
      await result.current.handleApprove();
    });

    expect(notifyError).toHaveBeenCalledWith("入力エラー");
    expect(notifySuccess).not.toHaveBeenCalledWith("承認しました");
  });

  it("有給の期間不備スキップ時はスキップ通知して承認成功通知しない", async () => {
    const workflow = createWorkflow({
      category: WorkflowCategory.PAID_LEAVE,
    });
    updateWorkflow.mockResolvedValue(
      createWorkflow({
        category: WorkflowCategory.PAID_LEAVE,
        status: WorkflowStatus.APPROVED,
      })
    );
    processPaidLeaveMock.mockResolvedValue({
      kind: "skipped",
      reason: "missing_period",
    });

    const { result } = renderHook(() =>
      useWorkflowApprovalActions({
        workflow,
        cognitoUser: { id: "cognito-approver-id" },
        staffs,
        updateWorkflow,
        setWorkflow,
        notifySuccess,
        notifyError,
        getStartTime: () => dayjs("2026-02-01T09:00:00"),
        getEndTime: () => dayjs("2026-02-01T18:00:00"),
        getLunchRestStartTime: () => dayjs("2026-02-01T12:00:00"),
        getLunchRestEndTime: () => dayjs("2026-02-01T13:00:00"),
        getAttendanceByStaffAndDate,
        createAttendance,
        updateAttendance,
      })
    );

    await act(async () => {
      await result.current.handleApprove();
    });

    expect(notifySuccess).toHaveBeenCalledWith(
      "有給申請を承認しました（勤怠情報の更新はスキップ）"
    );
    expect(notifySuccess).not.toHaveBeenCalledWith("承認しました");
  });
});
