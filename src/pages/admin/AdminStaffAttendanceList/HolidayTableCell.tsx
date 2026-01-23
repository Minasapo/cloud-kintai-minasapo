import { TableCell } from "@mui/material";
import {
  Attendance,
  CompanyHolidayCalendar,
  HolidayCalendar,
} from "@shared/api/graphql/types";

import { CompanyHoliday } from "@/entities/attendance/lib/CompanyHoliday";
import { Holiday } from "@/entities/attendance/lib/Holiday";

export function HolidayTableCell({
  attendance,
  holidayCalendars,
  companyHolidayCalendars,
}: {
  attendance: Attendance;
  holidayCalendars: HolidayCalendar[];
  companyHolidayCalendars: CompanyHolidayCalendar[];
}) {
  const holidayName = new Holiday(
    holidayCalendars,
    attendance.workDate
  ).getHoliday()?.name;

  const companyHolidayName = new CompanyHoliday(
    companyHolidayCalendars,
    attendance.workDate
  ).getHoliday()?.name;

  return (
    <TableCell sx={{ whiteSpace: "nowrap" }}>
      {holidayName || companyHolidayName || ""}
    </TableCell>
  );
}
