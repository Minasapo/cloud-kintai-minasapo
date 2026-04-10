import type { Attendance, CloseDate } from "@shared/api/graphql/types";

import { aggregateAttendanceStatistics } from "./aggregation";

describe("aggregateAttendanceStatistics", () => {
  it("締め日がある月はその期間で月別集計を返す", () => {
    const closeDates = [
      {
        id: "close-1",
        closeDate: "2026-01-31",
        startDate: "2026-01-01",
        endDate: "2026-01-31",
        updatedAt: "2026-01-31T00:00:00.000Z",
      },
    ] as CloseDate[];
    const attendances = [
      {
        id: "att-1",
        staffId: "staff-1",
        workDate: "2026-01-15",
        startTime: "2026-01-15T09:00:00.000Z",
        endTime: "2026-01-15T18:00:00.000Z",
        rests: [
          {
            startTime: "2026-01-15T12:00:00.000Z",
            endTime: "2026-01-15T13:00:00.000Z",
          },
        ],
        paidHolidayFlag: false,
        specialHolidayFlag: false,
        absentFlag: false,
      },
      {
        id: "att-2",
        staffId: "staff-1",
        workDate: "2026-01-20",
        paidHolidayFlag: true,
        specialHolidayFlag: false,
        absentFlag: false,
        rests: [],
      },
    ] as Attendance[];

    const result = aggregateAttendanceStatistics({
      attendances,
      closeDates,
      year: 2026,
    });

    expect(result.rangeStart).toBe("2026-01-01");
    expect(result.rangeEnd).toBe("2026-12-31");
    expect(result.monthlySummaries[0]).toEqual(
      expect.objectContaining({
        month: 1,
        rangeStart: "2026-01-01",
        rangeEnd: "2026-01-31",
        workHours: 8,
        workDays: 1,
        paidDays: 1,
        specialHolidayDays: 0,
        absentDays: 0,
        isFallback: false,
      }),
    );
    expect(result.totalWorkHours).toBe(8);
    expect(result.totalWorkDays).toBe(1);
    expect(result.totalPaidDays).toBe(1);
  });

  it("締め日未登録月は fallback 期間を使う", () => {
    const result = aggregateAttendanceStatistics({
      attendances: [],
      closeDates: [],
      year: 2026,
    });

    expect(result.monthlySummaries[0]).toEqual(
      expect.objectContaining({
        month: 1,
        rangeStart: "2026-01-01",
        rangeEnd: "2026-01-31",
        isFallback: true,
      }),
    );
    expect(result.hasFallbackTerms).toBe(true);
  });
});
