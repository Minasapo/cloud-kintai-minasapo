import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";

import {
  type WorkStatus,
  WorkStatusCodes,
  WorkStatusTexts,
} from "../../lib/common";
import { TimeRecorderView } from "../TimeRecorderView";

jest.mock("@/shared/ui/clock/Clock", () => ({
  __esModule: true,
  default: () => <div>clock</div>,
}));

jest.mock("../QuickDailyReportCard", () => ({
  __esModule: true,
  default: () => <div>daily-report</div>,
}));

jest.mock("../RestTimeMessage", () => ({
  __esModule: true,
  RestTimeMessage: () => <div>rest-time-message</div>,
}));

jest.mock("@/shared/ui/time-recorder/AttendanceErrorAlert", () => ({
  __esModule: true,
  default: () => <div>勤怠打刻エラー</div>,
}));

const workingStatus: WorkStatus = {
  code: WorkStatusCodes.WORKING,
  text: WorkStatusTexts.WORKING,
};

function renderView(overrides: Partial<ComponentProps<typeof TimeRecorderView>> = {}) {
  return render(
    <TimeRecorderView
      today="2026-03-18"
      staffId="staff-1"
      workStatus={workingStatus}
      directMode={false}
      hasChangeRequest={false}
      isAttendanceError={false}
      clockInDisplayText="09:00 出勤"
      clockOutDisplayText={null}
      onDirectModeChange={jest.fn()}
      onClockIn={jest.fn()}
      onClockOut={jest.fn()}
      onGoDirectly={jest.fn()}
      onReturnDirectly={jest.fn()}
      onRestStart={jest.fn()}
      onRestEnd={jest.fn()}
      timeElapsedErrorDialog={null}
      {...overrides}
    />,
  );
}

describe("TimeRecorderView", () => {
  it("通常モードでは標準の打刻ボタンを表示する", () => {
    renderView();

    expect(screen.getByTestId("work-status-text")).toHaveTextContent("勤務中");
    expect(screen.getByTestId("clock-in-time-text")).toHaveTextContent("09:00 出勤");
    expect(screen.getByTestId("clock-in-button")).toBeInTheDocument();
    expect(screen.getByTestId("clock-out-button")).toBeInTheDocument();
    expect(screen.queryByTestId("go-directly-button")).not.toBeInTheDocument();
  });

  it("直行直帰モードでは対応するボタンを表示し、トグル変更を通知する", () => {
    const handleDirectModeChange = jest.fn();

    renderView({
      directMode: true,
      onDirectModeChange: handleDirectModeChange,
    });

    fireEvent.click(screen.getByTestId("direct-mode-switch"));

    expect(screen.getByTestId("go-directly-button")).toBeInTheDocument();
    expect(screen.getByTestId("return-directly-button")).toBeInTheDocument();
    expect(handleDirectModeChange).toHaveBeenCalledWith(false);
  });

  it("変更リクエスト中は主要アクションを無効化して警告を表示する", () => {
    renderView({
      hasChangeRequest: true,
      isAttendanceError: true,
    });

    expect(screen.getByText("変更リクエスト申請中です。承認されるまで打刻はできません。")).toBeInTheDocument();
    expect(screen.getAllByText("勤怠打刻エラー").length).toBeGreaterThan(0);
    expect(screen.getByTestId("clock-out-button")).toBeDisabled();
    expect(screen.getByTestId("rest-start-button")).toBeDisabled();
    expect(screen.getAllByText("daily-report").length).toBeGreaterThan(0);
    expect(screen.getAllByText("rest-time-message").length).toBeGreaterThan(0);
  });
});
