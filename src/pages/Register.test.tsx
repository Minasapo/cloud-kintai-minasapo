import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import RegisterContent from "@/pages/register/RegisterContent";

jest.mock("@/widgets/layout/header/AdminPendingApprovalSummary", () => ({
  __esModule: true,
  default: () => (
    <div data-testid="admin-pending-approval-summary-mock">
      pending approvals
    </div>
  ),
}));

jest.mock(
  "@/features/attendance/time-recorder/ui/RegisterAttendanceSummaryCard",
  () => ({
    __esModule: true,
    default: ({
      attendanceErrorCount = 0,
    }: {
      attendanceErrorCount?: number;
    }) => (
      <div data-testid="register-dashboard-attendance-summary-card-mock">
        attendance summary: {attendanceErrorCount}
      </div>
    ),
  }),
);

jest.mock("@/features/attendance/time-recorder/ui/TimeRecorder", () => ({
  __esModule: true,
  default: ({
    onAttendanceErrorCountChange,
    onElapsedWorkTimeChange,
  }: {
    onAttendanceErrorCountChange?: (attendanceErrorCount: number) => void;
    onElapsedWorkTimeChange?: (payload: {
      visible: boolean;
      workDurationLabel: string;
      restDurationLabel: string;
    }) => void;
  }) => (
    <div data-testid="time-recorder-mock">
      <button
        type="button"
        data-testid="trigger-attendance-error"
        onClick={() => onAttendanceErrorCountChange?.(2)}
      >
        trigger error
      </button>
      <button
        type="button"
        data-testid="trigger-elapsed-work"
        onClick={() =>
          onElapsedWorkTimeChange?.({
            visible: true,
            workDurationLabel: "02:10",
            restDurationLabel: "00:00",
          })
        }
      >
        trigger elapsed
      </button>
      <button
        type="button"
        data-testid="trigger-elapsed-rest"
        onClick={() =>
          onElapsedWorkTimeChange?.({
            visible: true,
            workDurationLabel: "02:10",
            restDurationLabel: "00:15",
          })
        }
      >
        trigger rest elapsed
      </button>
    </div>
  ),
}));

function renderRegisterContent() {
  return render(
    <MemoryRouter>
      <RegisterContent
        configId="config-id"
        announcement={{ enabled: true, message: "管理者アナウンス" }}
      />
    </MemoryRouter>,
  );
}

describe("RegisterContent", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("右側カラムにアナウンスパネルを含むダッシュボードを描画する", () => {
    renderRegisterContent();

    const dashboardSlot = screen.getByTestId("register-dashboard-slot");
    expect(screen.getByTestId("time-recorder-mock")).toBeInTheDocument();
    expect(screen.getByTestId("register-dashboard-panel")).toBeInTheDocument();
    expect(
      screen.getByTestId("admin-pending-approval-summary-mock"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("register-dashboard-attendance-summary-card-mock"),
    ).toBeInTheDocument();
    expect(screen.getByText("attendance summary: 0")).toBeInTheDocument();
    expect(
      screen.getByTestId("register-dashboard-announcement-card"),
    ).toBeInTheDocument();
    expect(screen.getByText("管理者アナウンス")).toBeInTheDocument();
    expect(dashboardSlot).toHaveClass("hidden");
    expect(dashboardSlot).toHaveClass("lg:block");
  });

  it("打刻エラー件数を受け取ると直近の勤務状況カードへ件数を引き渡す", () => {
    renderRegisterContent();

    expect(screen.getByText("attendance summary: 0")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("trigger-attendance-error"));

    expect(screen.getByText("attendance summary: 2")).toBeInTheDocument();
  });

  it("勤務中のとき現在の勤務時間カードを表示する", () => {
    renderRegisterContent();

    expect(
      screen.queryByTestId("register-dashboard-elapsed-duration-cards"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("trigger-elapsed-work"));

    expect(
      screen.getByTestId("register-dashboard-elapsed-duration-cards"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("register-dashboard-current-work-card"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("register-dashboard-current-rest-card"),
    ).toBeInTheDocument();
    expect(screen.getByText("現在の勤務時間")).toBeInTheDocument();
    expect(
      screen.getByTestId("register-dashboard-current-work-info"),
    ).toHaveAttribute("aria-label", "休憩時間を差し引いた勤務時間を表示します");
    expect(screen.getByText("02:10")).toBeInTheDocument();
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  it("休憩中のとき現在の休憩時間カードを表示する", () => {
    renderRegisterContent();

    fireEvent.click(screen.getByTestId("trigger-elapsed-rest"));

    expect(
      screen.getByTestId("register-dashboard-elapsed-duration-cards"),
    ).toBeInTheDocument();
    expect(screen.getByText("02:10")).toBeInTheDocument();
    expect(screen.getByText("00:15")).toBeInTheDocument();
    expect(screen.getByText("現在の休憩時間")).toBeInTheDocument();
    expect(
      screen.getByTestId("register-dashboard-current-rest-info"),
    ).toHaveAttribute("aria-label", "休憩中のみカウントします");
  });
});
