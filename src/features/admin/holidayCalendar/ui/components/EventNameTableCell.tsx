import { TableCell } from "@mui/material";
import { EventCalendar } from "@shared/api/graphql/types";

export default function EventNameTableCell({
  eventCalendar,
}: {
  eventCalendar: EventCalendar;
}) {
  return <TableCell>{eventCalendar.name}</TableCell>;
}
