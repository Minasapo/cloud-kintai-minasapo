import dayjs from "dayjs";

type CloseDate = {
  startDate?: string | null;
  endDate?: string | null;
  updatedAt?: string | null;
  closeDate?: string | null;
};

export const resolveAggregationDateRange = (
  month: dayjs.Dayjs,
  closeDates: CloseDate[],
): { start: dayjs.Dayjs; end: dayjs.Dayjs } => {
  const monthStart = month.startOf("month");
  const monthEnd = month.endOf("month");
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

  if (applicableCloseDates.length > 0) {
    const containsToday = applicableCloseDates.find((item) => {
      const start = dayjs(item.startDate);
      const end = dayjs(item.endDate);
      return !today.isBefore(start, "day") && !today.isAfter(end, "day");
    });

    if (containsToday) {
      return {
        start: dayjs(containsToday.startDate),
        end: dayjs(containsToday.endDate),
      };
    }

    const latest = applicableCloseDates.reduce((prev, current) => {
      const prevUpdatedAt = dayjs(prev.updatedAt ?? prev.closeDate).valueOf();
      const currentUpdatedAt = dayjs(
        current.updatedAt ?? current.closeDate,
      ).valueOf();
      return currentUpdatedAt > prevUpdatedAt ? current : prev;
    });

    return {
      start: dayjs(latest.startDate),
      end: dayjs(latest.endDate),
    };
  }

  return {
    start: monthStart,
    end: monthEnd,
  };
};
