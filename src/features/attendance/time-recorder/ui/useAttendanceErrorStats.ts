import {
  Attendance,
  CompanyHolidayCalendar,
  HolidayCalendar,
  Staff,
} from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { useMemo } from "react";

import { summarizeAttendanceErrors } from "./timeRecorderUtils";

type UseAttendanceErrorStatsParams = {
  staff: Staff | undefined;
  attendances: Attendance[];
  holidayCalendars: HolidayCalendar[];
  companyHolidayCalendars: CompanyHolidayCalendar[];
  attendanceLoading: boolean;
  attendancesLoading: boolean;
  calendarLoading: boolean;
  attendanceErrorToday: dayjs.Dayjs;
};

export function useAttendanceErrorStats({
  staff,
  attendances,
  holidayCalendars,
  companyHolidayCalendars,
  attendanceLoading,
  attendancesLoading,
  calendarLoading,
  attendanceErrorToday,
}: UseAttendanceErrorStatsParams) {
  const { errorCount, hasTimeElapsedError } = useMemo(() => {
    if (!staff || attendanceLoading || attendancesLoading || calendarLoading) {
      return { errorCount: 0, hasTimeElapsedError: false };
    }
    return summarizeAttendanceErrors({
      staff,
      attendances,
      holidayCalendars,
      companyHolidayCalendars,
      today: attendanceErrorToday,
    });
  }, [
    staff,
    attendances,
    holidayCalendars,
    companyHolidayCalendars,
    attendanceLoading,
    attendancesLoading,
    calendarLoading,
    attendanceErrorToday,
  ]);
  return {
    attendanceErrorCount: errorCount,
    isAttendanceError: errorCount > 0,
    isTimeElapsedError: hasTimeElapsedError,
  };
}
