import { EventCalendar } from "@shared/api/graphql/types";

import { CalendarDateTableCell } from "./CalendarTableCells";

export default function EventDateTableCell({
  eventCalendar,
}: {
  eventCalendar: EventCalendar;
}) {
  return <CalendarDateTableCell date={eventCalendar.eventDate} />;
}

