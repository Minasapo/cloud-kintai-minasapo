import { AttendanceDate } from "@entities/attendance/lib/AttendanceDate";
import { AttendanceStatus } from "@entities/attendance/lib/AttendanceState";
import {
  Attendance,
  CompanyHolidayCalendar,
  HolidayCalendar,
  Staff,
} from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { useMemo } from "react";

import { getStatus } from "../lib/attendanceStatusUtils";
import { DateRange } from "./attendanceListUtils";

type Params = {
  staff: Staff | null | undefined;
  attendances: Attendance[];
  holidayCalendars: HolidayCalendar[];
  companyHolidayCalendars: CompanyHolidayCalendar[];
  effectiveDateRange: DateRange;
};

export const useErrorAttendances = ({
  staff,
  attendances,
  holidayCalendars,
  companyHolidayCalendars,
  effectiveDateRange,
}: Params): Attendance[] => {
  return useMemo(() => {
    if (!staff) return [];

    const today = dayjs();
    const rangeStart = effectiveDateRange.start;
    const rangeEnd = effectiveDateRange.end;
    const result: Attendance[] = [];

    let current = rangeStart;
    while (!current.isAfter(rangeEnd, "day")) {
      if (!current.isAfter(today, "day")) {
        const workDate = current.format(AttendanceDate.DataFormat);
        const existingAttendance = attendances.find(
          (a) => a.workDate === workDate,
        );
        const status = getStatus(
          existingAttendance,
          staff,
          holidayCalendars,
          companyHolidayCalendars,
          current,
        );
        if (
          status === AttendanceStatus.Error ||
          status === AttendanceStatus.Late
        ) {
          result.push(
            existingAttendance ?? {
              __typename: "Attendance",
              id: `missing-${workDate}`,
              staffId: staff.id,
              workDate,
              createdAt: "",
              updatedAt: "",
            },
          );
        }
      }

      current = current.add(1, "day");
    }

    return result;
  }, [
    staff,
    attendances,
    holidayCalendars,
    companyHolidayCalendars,
    effectiveDateRange,
  ]);
};
