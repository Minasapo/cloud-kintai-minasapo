import { TableCell } from "@mui/material";
import dayjs from "dayjs";

import { HolidayCalendar } from "@/API";
import { AttendanceDate } from "@/lib/AttendanceDate";

export default function HolidayDateTableCell({
  holidayCalendar,
}: {
  holidayCalendar: HolidayCalendar;
}) {
  const date = dayjs(holidayCalendar.holidayDate);
  const holidayDate = date.format(AttendanceDate.DisplayFormat);

  return <TableCell>{holidayDate}</TableCell>;
}
