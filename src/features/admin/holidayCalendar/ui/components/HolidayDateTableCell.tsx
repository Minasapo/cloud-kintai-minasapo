import { HolidayCalendar } from "@shared/api/graphql/types";

import { CalendarDateTableCell } from "./CalendarTableCells";

export default function HolidayDateTableCell({
  holidayCalendar,
}: {
  holidayCalendar: HolidayCalendar;
}) {
  return <CalendarDateTableCell date={holidayCalendar.holidayDate} />;
}

