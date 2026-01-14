/**
 * モバイル勤怠カレンダーの状態判定ロジック
 * 複数のコンポーネント間で共有される判定ロジック
 */
import {
  Attendance,
  CompanyHolidayCalendar,
  HolidayCalendar,
  Staff,
} from "@shared/api/graphql/types";
import dayjs, { Dayjs } from "dayjs";

import { AttendanceDate } from "@/lib/AttendanceDate";
import { AttendanceState, AttendanceStatus } from "@/lib/AttendanceState";
import { CompanyHoliday } from "@/lib/CompanyHoliday";
import { Holiday } from "@/lib/Holiday";

/**
 * 指定日付が祝日・会社休日・週末かどうかを判定
 */
export const isHolidayLike = (
  date: Dayjs,
  staff: Staff | null | undefined,
  holidayCalendars: HolidayCalendar[],
  companyHolidayCalendars: CompanyHolidayCalendar[]
): boolean => {
  const workDate = date.format(AttendanceDate.DataFormat);
  const isHoliday = new Holiday(holidayCalendars, workDate).isHoliday();
  const isCompanyHoliday = new CompanyHoliday(
    companyHolidayCalendars,
    workDate
  ).isHoliday();

  if (staff?.workType === "shift") {
    return isHoliday || isCompanyHoliday;
  }

  return isHoliday || isCompanyHoliday || [0, 6].includes(date.day());
};

/**
 * 指定日付の勤怠ステータスを判定
 * 打刻データがない場合は、営業日かどうかで Error/None を返す
 * 打刻データがある場合は、AttendanceState で詳細な状態を返す
 */
export const getStatus = (
  attendance: Attendance | undefined,
  staff: Staff | null | undefined,
  holidayCalendars: HolidayCalendar[],
  companyHolidayCalendars: CompanyHolidayCalendar[],
  date: Dayjs
): AttendanceStatus => {
  if (!staff) return AttendanceStatus.None;

  if (!attendance) {
    const today = dayjs();

    // 今日以降の日付は None
    if (date.isSame(today, "day") || date.isAfter(today, "day")) {
      return AttendanceStatus.None;
    }

    // 利用開始日より前は None
    if (
      staff.usageStartDate &&
      date.isBefore(dayjs(staff.usageStartDate), "day")
    ) {
      return AttendanceStatus.None;
    }

    // 祝日・会社休日・週末は None
    const holidayLike = isHolidayLike(
      date,
      staff,
      holidayCalendars,
      companyHolidayCalendars
    );
    if (holidayLike) return AttendanceStatus.None;

    // 過去の営業日で打刻データなし → Error
    return AttendanceStatus.Error;
  }

  // 打刻データがある場合は AttendanceState で判定
  return new AttendanceState(
    staff,
    attendance,
    holidayCalendars,
    companyHolidayCalendars
  ).get();
};
