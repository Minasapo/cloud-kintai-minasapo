import { TableCell } from "@mui/material";

import { HolidayCalendar } from "@/API";

export default function HolidayNameTableCell({
  holidayCalendar,
}: {
  holidayCalendar: HolidayCalendar;
}) {
  return <TableCell>{holidayCalendar.name}</TableCell>;
}
