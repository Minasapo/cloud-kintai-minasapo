import { fireEvent, render, screen } from "@testing-library/react";

import AdminAttendance from "./AdminAttendance";

jest.mock("@features/attendance/download-form/ui/DownloadForm", () => ({
  __esModule: true,
  default: () => <div>download-form</div>,
}));

jest.mock("@features/attendance/daily-list/ui/AttendanceDailyList", () => ({
  __esModule: true,
  default: () => <div>attendance-daily-list</div>,
}));

jest.mock("@features/admin-config-attendance/AttendanceSettingsDialog", () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) =>
    open ? <div>attendance-settings-dialog</div> : null,
}));

describe("AdminAttendance", () => {
  it("設定ボタンから勤怠設定ダイアログを開ける", () => {
    render(<AdminAttendance />);

    expect(screen.getByText("download-form")).toBeInTheDocument();
    expect(screen.getByText("attendance-daily-list")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "勤怠設定を開く" }));

    expect(screen.getByText("attendance-settings-dialog")).toBeInTheDocument();
  });
});
