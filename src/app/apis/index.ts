import type { Middleware, Reducer } from "@reduxjs/toolkit";

import { appConfigApi } from "@/entities/app-config/api/appConfigApi";
import { attendanceApi } from "@/entities/attendance/api/attendanceApi";
import { calendarApi } from "@/entities/calendar/api/calendarApi";

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
