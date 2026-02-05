import { TableCell } from "@mui/material";
import { EventCalendar } from "@shared/api/graphql/types";
import dayjs from "dayjs";

import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";

export default function EventDateTableCell({
  eventCalendar,
}: {
  eventCalendar: EventCalendar;
}) {
  const date = dayjs(eventCalendar.eventDate);
  const eventDate = date.format(AttendanceDate.DisplayFormat);

  return <TableCell>{eventDate}</TableCell>;
}
