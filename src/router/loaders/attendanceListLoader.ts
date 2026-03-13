import { fetchAuthSession } from "aws-amplify/auth";
import dayjs from "dayjs";

import { store } from "@/app/store";
import { attendanceApi } from "@/entities/attendance/api/attendanceApi";
import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";
import { calendarApi } from "@/entities/calendar/api/calendarApi";

async function resolveCognitoUserId(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    const sub = session.tokens?.idToken?.payload?.sub;
    return typeof sub === "string" && sub.length > 0 ? sub : null;
  } catch {
    return null;
  }
}

export async function attendanceListLoader(): Promise<null> {
  const userId = await resolveCognitoUserId();
  const startDate = dayjs().startOf("month").format(AttendanceDate.DataFormat);
  const endDate = dayjs().endOf("month").format(AttendanceDate.DataFormat);

  const tasks: Array<Promise<unknown>> = [
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
  ];

  if (userId) {
    tasks.push(
      store
        .dispatch(
          attendanceApi.endpoints.listAttendancesByDateRange.initiate(
            {
              staffId: userId,
              startDate,
              endDate,
            },
            { subscribe: false },
          ),
        )
        .unwrap(),
    );
  }

  await Promise.allSettled(tasks);
  return null;
}
