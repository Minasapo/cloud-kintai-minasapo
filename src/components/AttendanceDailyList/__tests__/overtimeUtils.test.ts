import { Attendance } from "@shared/api/graphql/types";

import {
  calculateTotalOvertimeMinutes,
  formatMinutesToHHmm,
} from "../overtimeUtils";

const createAttendance = (
  override: Partial<Attendance> & { endTime?: string | null }
): Attendance => ({
  __typename: "Attendance",
  id: override.id ?? "attendance-1",
  staffId: override.staffId ?? "staff-1",
  workDate: override.workDate ?? "2025-01-10",
  startTime: override.startTime ?? null,
  endTime: override.endTime ?? null,
  createdAt: override.createdAt ?? "2025-01-10T00:00:00Z",
  updatedAt: override.updatedAt ?? "2025-01-10T00:00:00Z",
  goDirectlyFlag: override.goDirectlyFlag ?? false,
  returnDirectlyFlag: override.returnDirectlyFlag ?? false,
  absentFlag: override.absentFlag ?? false,
  rests: override.rests ?? [],
  hourlyPaidHolidayTimes: override.hourlyPaidHolidayTimes ?? [],
  remarks: override.remarks ?? "",
  paidHolidayFlag: override.paidHolidayFlag ?? false,
  specialHolidayFlag: override.specialHolidayFlag ?? false,
  isDeemedHoliday: override.isDeemedHoliday ?? false,
  hourlyPaidHolidayHours: override.hourlyPaidHolidayHours ?? null,
  substituteHolidayDate: override.substituteHolidayDate ?? null,
  histories: override.histories ?? [],
  changeRequests: override.changeRequests ?? [],
  systemComments: override.systemComments ?? [],
  revision: override.revision ?? null,
});

describe("calculateTotalOvertimeMinutes", () => {
  it("returns accumulated overtime when end time exceeds schedule", () => {
    const attendances = [
      createAttendance({
        endTime: "2025-01-10T20:30:00+09:00",
      }),
      createAttendance({
        id: "attendance-2",
        workDate: "2025-01-09",
        endTime: "2025-01-09T19:15:00+09:00",
      }),
    ];

    expect(calculateTotalOvertimeMinutes(attendances, 18, 0)).toBe(225);
  });

  it("counts overtime even when working past midnight", () => {
    const attendances = [
      createAttendance({
        endTime: "2025-01-11T01:00:00+09:00",
      }),
    ];

    expect(calculateTotalOvertimeMinutes(attendances, 18, 0)).toBe(420);
  });

  it("ignores entries without valid end times", () => {
    const attendances = [createAttendance({ endTime: null })];

    expect(calculateTotalOvertimeMinutes(attendances, 18, 0)).toBe(0);
  });
});

describe("formatMinutesToHHmm", () => {
  it("returns 00:00 when minutes are zero or negative", () => {
    expect(formatMinutesToHHmm(0)).toBe("0:00");
    expect(formatMinutesToHHmm(-15)).toBe("0:00");
  });

  it("pads hours and minutes properly", () => {
    expect(formatMinutesToHHmm(5)).toBe("0:05");
    expect(formatMinutesToHHmm(150)).toBe("2:30");
  });
});
