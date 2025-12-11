import { TableCell } from "@mui/material";
import { HolidayCalendar } from "@shared/api/graphql/types";

export default function HolidayNameTableCell({
  holidayCalendar,
}: {
  holidayCalendar: HolidayCalendar;
}) {
  return <TableCell>{holidayCalendar.name}</TableCell>;
}
