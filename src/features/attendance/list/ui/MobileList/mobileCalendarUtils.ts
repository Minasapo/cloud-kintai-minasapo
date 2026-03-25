import {
  Attendance,
  CloseDate,
  CompanyHolidayCalendar,
  HolidayCalendar,
  Staff,
} from "@shared/api/graphql/types";
import dayjs, { Dayjs } from "dayjs";

import { AttendanceStatus } from "@/entities/attendance/lib/AttendanceState";

import { getStatus, isHolidayLike } from "../../lib/attendanceStatusUtils";

export type MonthTerm = {
  start: Dayjs;
  end: Dayjs;
  source: "closeDate" | "fallback";
  label: string;
  color: string;
};

export type HolidayInfo = {
  name: string;
  type: "holiday" | "company";
};

export type CalendarDay = {
  date: Dayjs;
  isCurrentMonth: boolean;
};

export type DayCellMeta = {
  status: AttendanceStatus;
  hasError: boolean;
  holidayInfo: HolidayInfo | null;
  termColor?: string;
};

const DATE_KEY_FORMAT = "YYYY-MM-DD";

export const statusLabelMap: Record<AttendanceStatus, string> = {
  [AttendanceStatus.Ok]: "OK",
  [AttendanceStatus.Error]: "要確認",
  [AttendanceStatus.Requesting]: "申請中",
  [AttendanceStatus.Late]: "遅刻",
  [AttendanceStatus.Working]: "勤務中",
  [AttendanceStatus.None]: "",
};

export const statusTextColorMap: Partial<Record<AttendanceStatus, string>> = {
  [AttendanceStatus.Ok]: "var(--mui-palette-success-main)",
  [AttendanceStatus.Error]: "var(--mui-palette-error-main)",
  [AttendanceStatus.Late]: "var(--mui-palette-warning-main)",
  [AttendanceStatus.Requesting]: "var(--mui-palette-info-main)",
  [AttendanceStatus.Working]: "var(--mui-palette-info-main)",
};

export const formatDateKey = (date: Dayjs) => date.format(DATE_KEY_FORMAT);

export const buildAttendanceMap = (attendances: Attendance[]) => {
  const map = new Map<string, Attendance>();
  attendances.forEach((attendance) => {
    map.set(formatDateKey(dayjs(attendance.workDate)), attendance);
  });
  return map;
};

export const createCalendarDays = (
  monthStart: Dayjs,
  monthEnd: Dayjs,
): CalendarDay[] => {
  const startDate = monthStart.subtract(monthStart.day(), "day");
  const endDate = monthEnd.add(6 - monthEnd.day(), "day");
  const days: CalendarDay[] = [];

  let current = startDate.clone();
  while (current.isBefore(endDate) || current.isSame(endDate, "day")) {
    days.push({
      date: current.clone(),
      isCurrentMonth: current.isSame(monthStart, "month"),
    });
    current = current.add(1, "day");
  }

  return days;
};

export const getHolidayInfoByDate = (
  date: Dayjs,
  holidayCalendars: HolidayCalendar[],
  companyHolidayCalendars: CompanyHolidayCalendar[],
): HolidayInfo | null => {
  const dateStr = formatDateKey(date);

  const holiday = holidayCalendars.find((h) => h.holidayDate === dateStr);
  if (holiday) {
    return { name: holiday.name || "祝日", type: "holiday" };
  }

  const companyHoliday = companyHolidayCalendars.find(
    (h) => h.holidayDate === dateStr,
  );
  if (companyHoliday) {
    return { name: companyHoliday.name || "会社休日", type: "company" };
  }

  return null;
};

const hasDayError = (
  attendance: Attendance | undefined,
  status: AttendanceStatus,
) => {
  return (
    (Array.isArray(attendance?.systemComments) &&
      attendance.systemComments.length > 0) ||
    status === AttendanceStatus.Error ||
    status === AttendanceStatus.Late
  );
};

const resolveDayTermColor = ({
  date,
  monthlyTerms,
  staff,
  holidayCalendars,
  companyHolidayCalendars,
}: {
  date: Dayjs;
  monthlyTerms: MonthTerm[];
  staff?: Staff | null;
  holidayCalendars: HolidayCalendar[];
  companyHolidayCalendars: CompanyHolidayCalendar[];
}) => {
  const isWeekend = [0, 6].includes(date.day());
  const holidayLike = isHolidayLike(
    date,
    staff,
    holidayCalendars,
    companyHolidayCalendars,
  );
  const allowTermHighlight =
    staff?.workType === "shift" ? true : !holidayLike && !isWeekend;

  if (!allowTermHighlight) return undefined;

  const primaryTerm = monthlyTerms.find(
    (term) =>
      !date.isBefore(term.start, "day") && !date.isAfter(term.end, "day"),
  );
  return primaryTerm?.color;
};

export const getDayCellMeta = ({
  date,
  attendance,
  staff,
  holidayCalendars,
  companyHolidayCalendars,
  monthlyTerms,
}: {
  date: Dayjs;
  attendance: Attendance | undefined;
  staff?: Staff | null;
  holidayCalendars: HolidayCalendar[];
  companyHolidayCalendars: CompanyHolidayCalendar[];
  monthlyTerms: MonthTerm[];
}): DayCellMeta => {
  const status = getStatus(
    attendance,
    staff,
    holidayCalendars,
    companyHolidayCalendars,
    date,
  );

  return {
    status,
    hasError: hasDayError(attendance, status),
    holidayInfo: getHolidayInfoByDate(
      date,
      holidayCalendars,
      companyHolidayCalendars,
    ),
    termColor: resolveDayTermColor({
      date,
      monthlyTerms,
      staff,
      holidayCalendars,
      companyHolidayCalendars,
    }),
  };
};

export const getStatusBadgeMeta = (status: AttendanceStatus) => {
  if (status === AttendanceStatus.Error) {
    return {
      label: "エラー",
      backgroundColor: "var(--mui-palette-error-light)",
      color: "var(--mui-palette-error-dark)",
    };
  }
  if (status === AttendanceStatus.Late) {
    return {
      label: "遅刻",
      backgroundColor: "var(--mui-palette-warning-light)",
      color: "var(--mui-palette-warning-dark)",
    };
  }
  if (status === AttendanceStatus.Ok) {
    return {
      label: "正常",
      backgroundColor: "var(--mui-palette-success-light)",
      color: "var(--mui-palette-success-dark)",
    };
  }
  return {
    label: "未入力",
    backgroundColor: "var(--mui-palette-grey-200)",
    color: "var(--mui-palette-text-secondary)",
  };
};

export const formatTimeRange = (
  startTime?: string | null,
  endTime?: string | null,
  emptyLabel = "--:--",
) => {
  const formattedStart = startTime ? dayjs(startTime).format("HH:mm") : "--:--";
  const formattedEnd = endTime ? dayjs(endTime).format("HH:mm") : "--:--";

  if (!startTime && !endTime) return emptyLabel;
  return `${formattedStart} 〜 ${formattedEnd}`;
};

const formatMobileTermLabel = (start: Dayjs, end: Dayjs) => {
  const useYear = start.year() !== end.year();
  const format = useYear ? "YY/M/D" : "M/D";
  return `${start.format(format)}〜${end.format(format)}`;
};

export const resolveMonthlyTerms = (
  currentMonth: Dayjs,
  closeDates: CloseDate[] = [],
  palette: string[],
): MonthTerm[] => {
  const monthStart = currentMonth.startOf("month");
  const monthEnd = currentMonth.endOf("month");

  const fallback: MonthTerm = {
    start: monthStart,
    end: monthEnd,
    source: "fallback",
    label: formatMobileTermLabel(monthStart, monthEnd),
    color: palette[0] ?? "#90CAF9",
  };

  if (closeDates.length === 0) return [fallback];

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
        label: formatMobileTermLabel(start, end),
        color: palette[index % palette.length] ?? palette[0] ?? "#90CAF9",
      }),
    );

  if (terms.length === 0) return [fallback];
  return terms;
};
