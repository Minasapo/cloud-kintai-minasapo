import {
  Attendance,
  CompanyHolidayCalendar,
  HolidayCalendar,
  Staff,
} from "@shared/api/graphql/types";
import dayjs, { Dayjs } from "dayjs";

import { AttendanceStatus } from "@/entities/attendance/lib/AttendanceState";

import { getStatus } from "../../lib/attendanceStatusUtils";

type ErrorStatusCheckParams = {
  attendances: Attendance[];
  holidayCalendars: HolidayCalendar[];
  companyHolidayCalendars: CompanyHolidayCalendar[];
  staff: Staff | null | undefined;
  currentMonth: Dayjs;
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
  currentMonth,
}: ErrorStatusCheckParams) {
  if (!staff) return false;
  const today = dayjs();

  const monthStart = currentMonth.startOf("month");
  const monthEnd = currentMonth.endOf("month");

  let current = monthStart;

  while (current.isBefore(monthEnd) || current.isSame(monthEnd, "day")) {
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
