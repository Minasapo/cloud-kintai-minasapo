import { TableCell } from "@mui/material";
import { HolidayCalendar } from "@shared/api/graphql/types";
import dayjs from "dayjs";

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
