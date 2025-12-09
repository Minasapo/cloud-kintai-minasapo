import type { Middleware, Reducer } from "@reduxjs/toolkit";

import { attendanceApi } from "@/entities/attendance/api/attendanceApi";
import { calendarApi } from "@/entities/calendar/api/calendarApi";
import { appConfigApi } from "@/lib/api/appConfigApi";

export type RegisteredRtkApi = {
  reducerPath: string;
  reducer: Reducer;
  middleware: Middleware;
  util?: {
    resetApiState: () => unknown;
  };
};

export const rtkApis: RegisteredRtkApi[] = [
  attendanceApi,
  calendarApi,
  appConfigApi,
];
