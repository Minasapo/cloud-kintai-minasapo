import { TableCell } from "@mui/material";
import dayjs from "dayjs";

import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";

export default function CreatedAtTableCell({
  holidayCalendar: calendar,
}: {
  holidayCalendar: { createdAt?: string | null };
}) {
  const date = dayjs(calendar.createdAt);
  const createdAt = date.format(AttendanceDate.DisplayFormat);

  return <TableCell>{createdAt}</TableCell>;
}
