import dayjs, { Dayjs } from "dayjs";

import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";

export const MAX_HOLIDAY_RANGE_DAYS = 366;

type HolidayDateRangeErrorCode =
  | "INVALID_START_DATE"
  | "INVALID_END_DATE"
  | "END_BEFORE_START"
  | "RANGE_TOO_LARGE";

export class HolidayDateRangeError extends Error {
  code: HolidayDateRangeErrorCode;

  constructor(message: string, code: HolidayDateRangeErrorCode) {
    super(message);
    this.name = "HolidayDateRangeError";
    this.code = code;
  }
}

const parseDate = (value: string, code: HolidayDateRangeErrorCode) => {
  const parsed = dayjs(value, AttendanceDate.DataFormat, true);

  if (!parsed.isValid()) {
    throw new HolidayDateRangeError(
      code === "INVALID_START_DATE"
        ? "開始日はYYYY-MM-DD形式で入力してください。"
        : "終了日はYYYY-MM-DD形式で入力してください。",
      code
    );
  }

  return parsed.startOf("day");
};

const ensureRangeOrder = (start: Dayjs, end: Dayjs) => {
  if (end.isBefore(start)) {
    throw new HolidayDateRangeError(
      "終了日は開始日以降の日付を指定してください。",
      "END_BEFORE_START"
    );
  }
};

const ensureRangeLimit = (days: number, maxDays: number) => {
  if (days > maxDays) {
    throw new HolidayDateRangeError(
      `一度に登録できる期間は最大${maxDays}日までです。`,
      "RANGE_TOO_LARGE"
    );
  }
};

export const buildHolidayDateRange = (
  startDate: string,
  endDate?: string | null,
  options?: { maxRangeDays?: number }
): string[] => {
  if (!startDate) {
    throw new HolidayDateRangeError(
      "開始日は必須項目です。",
      "INVALID_START_DATE"
    );
  }

  const start = parseDate(startDate, "INVALID_START_DATE");
  const end = parseDate(endDate ?? startDate, "INVALID_END_DATE");

  ensureRangeOrder(start, end);

  const inclusiveDays = end.diff(start, "day") + 1;
  const limit = options?.maxRangeDays ?? MAX_HOLIDAY_RANGE_DAYS;

  ensureRangeLimit(inclusiveDays, limit);

  return Array.from({ length: inclusiveDays }, (_, index) =>
    start.add(index, "day").toISOString()
  );
};
