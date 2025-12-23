import dayjs from "dayjs";

import {
  Attendance,
  CompanyHolidayCalendar,
  HolidayCalendar,
} from "@shared/api/graphql/types";

import { AttendanceDate } from "@/lib/AttendanceDate";
import { CompanyHoliday } from "@/lib/CompanyHoliday";
import { DayOfWeek, DayOfWeekString } from "@/lib/DayOfWeek";
import { Holiday } from "@/lib/Holiday";

export const getAttendanceRowClassName = (
  attendance: Attendance,
  holidayCalendars: HolidayCalendar[],
  companyHolidayCalendars: CompanyHolidayCalendar[]
) => {
  const { workDate } = attendance;
  const today = dayjs().format(AttendanceDate.DataFormat);
  if (workDate === today) {
    return "table-row--today";
  }

  const isHoliday = new Holiday(holidayCalendars, workDate).isHoliday();
  const isCompanyHoliday = new CompanyHoliday(
    companyHolidayCalendars,
    workDate
  ).isHoliday();

  if (isHoliday || isCompanyHoliday) {
    return "table-row--sunday";
  }

  const dayOfWeek = new DayOfWeek(holidayCalendars).getLabel(workDate);
  switch (dayOfWeek) {
    case DayOfWeekString.Sat:
      return "table-row--saturday";
    case DayOfWeekString.Sun:
    case DayOfWeekString.Holiday:
      return "table-row--sunday";
    default:
      return "table-row--default";
  }
};
