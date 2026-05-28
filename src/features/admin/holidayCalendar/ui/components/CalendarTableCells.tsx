import { AttendanceDate } from "@entities/attendance/lib/AttendanceDate";
import { DateDisplayCell, TextDisplayCell } from "@shared/ui/table";

export function CalendarDateTableCell({ date }: { date: string }) {
  return <DateDisplayCell date={date} format={AttendanceDate.DisplayFormat} />;
}

export function CalendarNameTableCell({ name }: { name: string }) {
  return <TextDisplayCell value={name} />;
}
