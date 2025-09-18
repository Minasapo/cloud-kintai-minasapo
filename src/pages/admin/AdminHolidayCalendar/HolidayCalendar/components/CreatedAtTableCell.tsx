import { TableCell } from "@mui/material";
import dayjs from "dayjs";

import { HolidayCalendar } from "@/API";
import { AttendanceDate } from "@/lib/AttendanceDate";

export default function CreatedAtTableCell({
  holidayCalendar,
}: {
  holidayCalendar: HolidayCalendar;
}) {
  const date = dayjs(holidayCalendar.createdAt);
  const createdAt = date.format(AttendanceDate.DisplayFormat);

  return <TableCell>{createdAt}</TableCell>;
}
