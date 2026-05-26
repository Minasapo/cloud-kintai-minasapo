import { HolidayCalendar } from "@shared/api/graphql/types";

import { CalendarNameTableCell } from "./CalendarTableCells";

export default function HolidayNameTableCell({
  holidayCalendar,
}: {
  holidayCalendar: HolidayCalendar;
}) {
  return <CalendarNameTableCell name={holidayCalendar.name} />;
}

