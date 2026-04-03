import {
  Attendance,
  CompanyHolidayCalendar,
  HolidayCalendar,
  Staff,
} from "@shared/api/graphql/types";
import dayjs, { Dayjs } from "dayjs";

import { AttendanceStatus } from "@/entities/attendance/lib/AttendanceState";

import { getStatus } from "../../lib/attendanceStatusUtils";
import { DateRange } from "../attendanceListUtils";

type ErrorStatusCheckParams = {
  attendances: Attendance[];
  holidayCalendars: HolidayCalendar[];
  companyHolidayCalendars: CompanyHolidayCalendar[];
  staff: Staff | null | undefined;
  effectiveDateRange: DateRange;
};

type DayStatusParams = {
  date: Dayjs;
  attendances: Attendance[];
  holidayCalendars: HolidayCalendar[];
  companyHolidayCalendars: CompanyHolidayCalendar[];
  staff: Staff | null | undefined;
};

export function hasErrorOrLateInMonth({
  attendances,
  holidayCalendars,
  companyHolidayCalendars,
  staff,
  effectiveDateRange,
}: ErrorStatusCheckParams) {
  if (!staff) return false;
  const today = dayjs();

  const rangeStart = effectiveDateRange.start;
  const rangeEnd = effectiveDateRange.end;

  let current = rangeStart;

  while (current.isBefore(rangeEnd) || current.isSame(rangeEnd, "day")) {
    if (current.isAfter(today, "day")) {
      current = current.add(1, "day");
      continue;
    }

    if (
      hasErrorOrLateStatusOnDate({
        date: current,
        attendances,
        staff,
        holidayCalendars,
        companyHolidayCalendars,
      })
    ) {
      return true;
    }

    current = current.add(1, "day");
  }

  return false;
}

function hasErrorOrLateStatusOnDate({
  date,
  attendances,
  staff,
  holidayCalendars,
  companyHolidayCalendars,
}: DayStatusParams) {
  const attendance = findAttendanceByDate(attendances, date);
  const status = getStatus(
    attendance,
    staff,
    holidayCalendars,
    companyHolidayCalendars,
    date
  );

  return status === AttendanceStatus.Error || status === AttendanceStatus.Late;
}

function findAttendanceByDate(attendances: Attendance[], targetDate: Dayjs) {
  return attendances.find((attendance) =>
    dayjs(attendance.workDate).isSame(targetDate, "day")
  );
}
