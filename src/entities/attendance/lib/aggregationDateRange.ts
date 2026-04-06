import dayjs, { Dayjs } from "dayjs";

export type CloseDatePeriod = {
  startDate?: string | null;
  endDate?: string | null;
  closeDate?: string | null;
  updatedAt?: string | null;
};

export type DateRange = {
  start: Dayjs;
  end: Dayjs;
};

export const getEffectiveDateRange = (
  currentMonth: Dayjs,
  closeDates: CloseDatePeriod[],
): DateRange & { hasValidPeriod: boolean } => {
  const monthStart = currentMonth.startOf("month");
  const monthEnd = currentMonth.endOf("month");
  const today = dayjs();

  const applicableCloseDates = closeDates.filter((closeDate) => {
    const start = dayjs(closeDate.startDate);
    const end = dayjs(closeDate.endDate);
    return (
      start.isValid() &&
      end.isValid() &&
      !end.isBefore(monthStart, "day") &&
      !start.isAfter(monthEnd, "day")
    );
  });

  if (applicableCloseDates.length === 0) {
    return {
      start: monthStart,
      end: monthEnd,
      hasValidPeriod: false,
    };
  }

  const containingToday = applicableCloseDates.find((closeDate) => {
    const start = dayjs(closeDate.startDate);
    const end = dayjs(closeDate.endDate);
    return !today.isBefore(start, "day") && !today.isAfter(end, "day");
  });

  if (containingToday) {
    return {
      start: dayjs(containingToday.startDate),
      end: dayjs(containingToday.endDate),
      hasValidPeriod: true,
    };
  }

  const latestCloseDate = applicableCloseDates.reduce((prev, current) => {
    const prevUpdatedAt = dayjs(prev.updatedAt ?? prev.closeDate).valueOf();
    const currentUpdatedAt = dayjs(
      current.updatedAt ?? current.closeDate,
    ).valueOf();
    return currentUpdatedAt > prevUpdatedAt ? current : prev;
  });

  return {
    start: dayjs(latestCloseDate.startDate),
    end: dayjs(latestCloseDate.endDate),
    hasValidPeriod: true,
  };
};

export const getAttendanceQueryDateRange = (
  currentMonth: Dayjs,
  effectiveDateRange: DateRange,
): DateRange => {
  const monthStart = currentMonth.startOf("month");
  const monthEnd = currentMonth.endOf("month");

  return {
    start: effectiveDateRange.start.isBefore(monthStart, "day")
      ? effectiveDateRange.start
      : monthStart,
    end: effectiveDateRange.end.isAfter(monthEnd, "day")
      ? effectiveDateRange.end
      : monthEnd,
  };
};

export const getEffectivePastDateRangeEnd = (
  effectiveDateRange: DateRange,
  today: Dayjs,
): Dayjs => {
  const currentDay = today.startOf("day");
  return effectiveDateRange.end.isAfter(currentDay, "day")
    ? currentDay
    : effectiveDateRange.end.startOf("day");
};

export const formatDateRangeLabel = (range: DateRange): string => {
  const startLabel = range.start.format("M/D");
  const endLabel = range.end.format("M/D");
  return `${startLabel}〜${endLabel}`;
};
