import { store } from "@/app/store";
import { calendarApi } from "@/entities/calendar/api/calendarApi";

export async function adminDashboardLoader(): Promise<null> {
  await Promise.allSettled([
    store
      .dispatch(
        calendarApi.endpoints.getHolidayCalendars.initiate(undefined, {
          subscribe: false,
        }),
      )
      .unwrap(),
    store
      .dispatch(
        calendarApi.endpoints.getCompanyHolidayCalendars.initiate(undefined, {
          subscribe: false,
        }),
      )
      .unwrap(),
    store
      .dispatch(
        calendarApi.endpoints.getEventCalendars.initiate(undefined, {
          subscribe: false,
        }),
      )
      .unwrap(),
  ]);

  return null;
}
