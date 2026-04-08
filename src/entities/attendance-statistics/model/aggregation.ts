import { AttendanceDate } from "@entities/attendance/lib/AttendanceDate";
import { calcTotalRestTime, calcTotalWorkTime } from "@entities/attendance/lib/time";
import type { Attendance, CloseDate } from "@shared/api/graphql/types";
import dayjs from "dayjs";

import type { AttendanceStatisticsMonthlySummary } from "./types";

type MonthlyTerm = {
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
  closeMonth: dayjs.Dayjs;
  source: "closeDate" | "fallback";
};

export type AttendanceStatisticsAggregationResult = {
  rangeStart: string;
  rangeEnd: string;
  monthlySummaries: AttendanceStatisticsMonthlySummary[];
  totalWorkHours: number;
  totalPaidDays: number;
  totalSpecialHolidayDays: number;
  totalAbsentDays: number;
  totalWorkDays: number;
  hasFallbackTerms: boolean;
};

type MonthlyTotals = Omit<
  AttendanceStatisticsMonthlySummary,
  "month" | "rangeStart" | "rangeEnd" | "isFallback"
>;

export function buildMonthlyTerms(
  year: number,
  closeDates: CloseDate[],
): MonthlyTerm[] {
  const fallback = Array.from({ length: 12 }, (_, index): MonthlyTerm => {
    const closeMonth = dayjs().year(year).month(index).startOf("month");
    return {
      start: closeMonth.startOf("month"),
      end: closeMonth.endOf("month"),
      closeMonth,
      source: "fallback",
    };
  });

  const latestByMonth: Array<{ item: CloseDate; updatedAt: number } | null> =
    Array.from({ length: 12 }, () => null);

  closeDates.forEach((item) => {
    const close = dayjs(item.closeDate);
    if (!close.isValid() || close.year() !== year) return;

    const monthIndex = close.month();
    const updatedAt = dayjs(item.updatedAt ?? item.closeDate).valueOf();
    const existing = latestByMonth[monthIndex];

    if (!existing || updatedAt > existing.updatedAt) {
      latestByMonth[monthIndex] = { item, updatedAt };
    }
  });

  latestByMonth.forEach((payload, index) => {
    if (!payload) return;

    const { item } = payload;
    const start = dayjs(item.startDate).startOf("day");
    const end = dayjs(item.endDate).startOf("day");
    if (!start.isValid() || !end.isValid()) return;

    fallback[index] = {
      start,
      end,
      closeMonth: dayjs(item.closeDate).startOf("month"),
      source: "closeDate",
    };
  });

  return fallback;
}

function buildMonthlyTotals(
  attendances: Attendance[],
  monthlyTerms: MonthlyTerm[],
): MonthlyTotals[] {
  const monthly = monthlyTerms.map(
    (): MonthlyTotals => ({
      workHours: 0,
      paidDays: 0,
      specialHolidayDays: 0,
      absentDays: 0,
      workDays: 0,
    }),
  );

  attendances.forEach((attendance) => {
    const workDate = dayjs(attendance.workDate).startOf("day");
    if (!workDate.isValid()) return;

    const monthIndex = monthlyTerms.findIndex(
      (term) =>
        !workDate.isBefore(term.start, "day") &&
        !workDate.isAfter(term.end, "day"),
    );

    const targetIndex = monthIndex === -1 ? workDate.month() : monthIndex;
    const stat = monthly[targetIndex];
    if (!stat) return;

    if (attendance.paidHolidayFlag) {
      stat.paidDays += 1;
    }

    if (attendance.specialHolidayFlag) {
      stat.specialHolidayDays += 1;
    }

    if (attendance.absentFlag) {
      stat.absentDays += 1;
    }

    if (attendance.startTime && attendance.endTime) {
      const gross = calcTotalWorkTime(attendance.startTime, attendance.endTime);
      const totalRest = (attendance.rests ?? [])
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .reduce((sum, rest) => {
          if (!rest.startTime || !rest.endTime) return sum;
          return sum + calcTotalRestTime(rest.startTime, rest.endTime);
        }, 0);

      const net = Math.max(gross - totalRest, 0);
      stat.workHours = Number((stat.workHours + net).toFixed(1));
      stat.workDays += 1;
    }
  });

  return monthly;
}

export function aggregateAttendanceStatistics(params: {
  attendances: Attendance[];
  closeDates: CloseDate[];
  year: number;
}): AttendanceStatisticsAggregationResult {
  const monthlyTerms = buildMonthlyTerms(params.year, params.closeDates);
  const monthlyTotals = buildMonthlyTotals(params.attendances, monthlyTerms);

  const monthlySummaries = monthlyTerms.map((term, index) => ({
    month: term.closeMonth.month() + 1,
    rangeStart: term.start.format(AttendanceDate.DataFormat),
    rangeEnd: term.end.format(AttendanceDate.DataFormat),
    isFallback: term.source === "fallback",
    ...monthlyTotals[index],
  }));

  const rangeStart = monthlyTerms
    .map((term) => term.start)
    .reduce((earliest, current) =>
      current.isBefore(earliest) ? current : earliest,
    )
    .format(AttendanceDate.DataFormat);

  const rangeEnd = monthlyTerms
    .map((term) => term.end)
    .reduce((latest, current) => (current.isAfter(latest) ? current : latest))
    .format(AttendanceDate.DataFormat);

  return {
    rangeStart,
    rangeEnd,
    monthlySummaries,
    totalWorkHours: Number(
      monthlySummaries.reduce((sum, item) => sum + item.workHours, 0).toFixed(1),
    ),
    totalPaidDays: monthlySummaries.reduce((sum, item) => sum + item.paidDays, 0),
    totalSpecialHolidayDays: monthlySummaries.reduce(
      (sum, item) => sum + item.specialHolidayDays,
      0,
    ),
    totalAbsentDays: monthlySummaries.reduce(
      (sum, item) => sum + item.absentDays,
      0,
    ),
    totalWorkDays: monthlySummaries.reduce((sum, item) => sum + item.workDays, 0),
    hasFallbackTerms: monthlySummaries.some((item) => item.isFallback),
  };
}
