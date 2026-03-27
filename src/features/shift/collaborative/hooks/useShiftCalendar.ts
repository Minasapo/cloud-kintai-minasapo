import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import { useMemo } from "react";

export type ShiftEvent = {
  label: string;
  start: dayjs.Dayjs;
  end?: dayjs.Dayjs;
  color: string;
};

export const useShiftCalendar = (
  currentMonth: dayjs.Dayjs,
  registeredEventCalendars: Array<{
    id: string;
    eventDate: string;
    name: string;
  }>,
  holidays: Array<{
    holidayDate: string;
    name: string;
  }>,
  companyHolidays: Array<{
    holidayDate: string;
    name: string;
  }>
) => {
  const theme = useTheme();
  const monthStart = useMemo(
    () => currentMonth.startOf("month"),
    [currentMonth]
  );
  const daysInMonth = monthStart.daysInMonth();
  const days = useMemo(
    () =>
      Array.from({ length: daysInMonth }).map((_, i) =>
        monthStart.add(i, "day")
      ),
    [monthStart, daysInMonth]
  );
  const eventCalendar = useMemo<ShiftEvent[]>(() => {
    const events: ShiftEvent[] = [];

    // イベントカレンダー
    events.push(
      ...registeredEventCalendars.map((event) => ({
        label: event.name,
        start: dayjs(event.eventDate),
        end: dayjs(event.eventDate),
        color: theme.palette.info.main,
      }))
    );

    // 祝祭日カレンダー
    events.push(
      ...holidays.map((holiday) => ({
        label: holiday.name,
        start: dayjs(holiday.holidayDate),
        end: dayjs(holiday.holidayDate),
        color: theme.palette.error.main,
      }))
    );

    // 会社休日カレンダー
    events.push(
      ...companyHolidays.map((holiday) => ({
        label: holiday.name,
        start: dayjs(holiday.holidayDate),
        end: dayjs(holiday.holidayDate),
        color: theme.palette.warning.main,
      }))
    );

    return events;
  }, [registeredEventCalendars, holidays, companyHolidays, theme]);
  const dateKeys = useMemo(() => days.map((day) => day.format("DD")), [days]);

  return { days, dateKeys, eventCalendar };
};
