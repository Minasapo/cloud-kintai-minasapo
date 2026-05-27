import { EventCalendar } from "@shared/api/graphql/types";

import { CalendarNameTableCell } from "./CalendarTableCells";

export default function EventNameTableCell({
  eventCalendar,
}: {
  eventCalendar: EventCalendar;
}) {
  return <CalendarNameTableCell name={eventCalendar.name} />;
}

