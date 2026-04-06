import {
  useGetCompanyHolidayCalendarsQuery,
  useGetHolidayCalendarsQuery,
} from "@entities/calendar/api/calendarApi";
import type {
  CompanyHolidayCalendar,
  HolidayCalendar,
} from "@shared/api/graphql/types";

type UseCalendarsOptions = {
  skip?: boolean;
};

type UseCalendarsResult = {
  holidayCalendars: HolidayCalendar[];
  companyHolidayCalendars: CompanyHolidayCalendar[];
  isLoading: boolean;
  error: unknown;
};

export function useCalendars(
  options: UseCalendarsOptions = {},
): UseCalendarsResult {
  const { skip = false } = options;

  const {
    data: holidayCalendars = [],
    isLoading: isHolidayCalendarsLoading,
    isFetching: isHolidayCalendarsFetching,
    error: holidayCalendarsError,
  } = useGetHolidayCalendarsQuery(undefined, { skip });

  const {
    data: companyHolidayCalendars = [],
    isLoading: isCompanyHolidayCalendarsLoading,
    isFetching: isCompanyHolidayCalendarsFetching,
    error: companyHolidayCalendarsError,
  } = useGetCompanyHolidayCalendarsQuery(undefined, { skip });

  const isLoading =
    isHolidayCalendarsLoading ||
    isHolidayCalendarsFetching ||
    isCompanyHolidayCalendarsLoading ||
    isCompanyHolidayCalendarsFetching;

  const error = holidayCalendarsError ?? companyHolidayCalendarsError ?? null;

  return { holidayCalendars, companyHolidayCalendars, isLoading, error };
}
