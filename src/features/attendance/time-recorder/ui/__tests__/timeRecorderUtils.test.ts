import dayjs from "dayjs";

import { AttendanceStatus } from "@/entities/attendance/lib/AttendanceState";

import { summarizeAttendanceErrors } from "../timeRecorderUtils";

const mockAttendanceStateGet = jest.fn();

jest.mock("@/entities/attendance/lib/AttendanceState", () => ({
  AttendanceStatus: {
    Ok: "OK",
    Error: "Error",
    Requesting: "申請中",
    Late: "遅刻",
    Working: "勤務中",
    None: "",
  },
  AttendanceState: jest.fn().mockImplementation(() => ({
    get: () => mockAttendanceStateGet(),
  })),
}));

describe("summarizeAttendanceErrors", () => {
  beforeEach(() => {
    mockAttendanceStateGet.mockReset();
  });

  it("当日を除外して打刻エラー日数を集計する", () => {
    mockAttendanceStateGet
      .mockReturnValueOnce(AttendanceStatus.Error)
      .mockReturnValueOnce(AttendanceStatus.Error)
      .mockReturnValueOnce(AttendanceStatus.Error);

    const result = summarizeAttendanceErrors({
      staff: { id: "staff-1" } as never,
      attendances: [
        { workDate: "2026-03-25" } as never,
        { workDate: "2026-03-26" } as never,
        { workDate: "2026-03-27" } as never,
      ],
      holidayCalendars: [],
      companyHolidayCalendars: [],
      today: dayjs("2026-03-27T00:00:00+09:00"),
    });

    expect(result).toEqual({
      errorCount: 2,
      hasTimeElapsedError: false,
    });
  });

  it("1週間超の打刻エラーがある場合は経過エラーフラグを立てる", () => {
    mockAttendanceStateGet.mockReturnValue(AttendanceStatus.Error);

    const result = summarizeAttendanceErrors({
      staff: { id: "staff-1" } as never,
      attendances: [{ workDate: "2026-03-10" } as never],
      holidayCalendars: [],
      companyHolidayCalendars: [],
      today: dayjs("2026-03-19T00:00:00+09:00"),
    });

    expect(result).toEqual({
      errorCount: 1,
      hasTimeElapsedError: true,
    });
  });
});
