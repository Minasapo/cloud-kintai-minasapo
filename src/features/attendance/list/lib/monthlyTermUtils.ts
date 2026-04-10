import { AttendanceDate } from "@entities/attendance/lib/AttendanceDate";
import { CloseDate } from "@shared/api/graphql/types";
import dayjs, { Dayjs } from "dayjs";

export type MonthTerm = {
  start: Dayjs;
  end: Dayjs;
  source: "closeDate" | "fallback";
  label: string;
  color: string;
};

/**
 * モバイル向けのラベルフォーマット
 */
const formatMobileTermLabel = (start: Dayjs, end: Dayjs) => {
  const useYear = start.year() !== end.year();
  const format = useYear ? "YY/M/D" : "M/D";
  return `${start.format(format)}〜${end.format(format)}`;
};

/**
 * デスクトップ向けのラベルフォーマット
 */
const formatDesktopTermLabel = (start: Dayjs, end: Dayjs) => {
  return `${start.format(AttendanceDate.DisplayFormat)} 〜 ${end.format(
    AttendanceDate.DisplayFormat
  )}`;
};

/**
 * 集計対象月の表示期間（マンスリーターム）を解決する
 */
export const resolveMonthlyTerms = (
  currentMonth: Dayjs,
  closeDates: CloseDate[] = [],
  palette: string[],
  variant: "desktop" | "mobile" = "desktop"
): MonthTerm[] => {
  const monthStart = currentMonth.startOf("month");
  const monthEnd = currentMonth.endOf("month");

  const formatLabel = variant === "mobile" ? formatMobileTermLabel : formatDesktopTermLabel;

  const fallback: MonthTerm = {
    start: monthStart,
    end: monthEnd,
    source: "fallback",
    label: formatLabel(monthStart, monthEnd),
    color: palette[0] ?? "#90CAF9",
  };

  if (closeDates.length === 0) {
    return [fallback];
  }

  const terms = closeDates
    .map((item) => {
      const start = dayjs(item.startDate);
      const end = dayjs(item.endDate);
      return { start, end };
    })
    .filter(({ start, end }) => {
      return (
        start.isValid() &&
        end.isValid() &&
        // 月の範囲と少しでも重なれば対象
        !end.isBefore(monthStart, "day") &&
        !start.isAfter(monthEnd, "day")
      );
    })
    .toSorted((a, b) => a.start.valueOf() - b.start.valueOf())
    .map(
      ({ start, end }, index): MonthTerm => ({
        start: start.startOf("day"),
        end: end.startOf("day"),
        source: "closeDate",
        label: formatLabel(start, end),
        color: palette[index % palette.length] ?? palette[0] ?? "#90CAF9",
      })
    );

  if (terms.length === 0) return [fallback];
  return terms;
};
