import type { Middleware, Reducer } from "@reduxjs/toolkit";

import { attendanceApi } from "@/entities/attendance/api/attendanceApi";
import { appConfigApi } from "@/lib/api/appConfigApi";
import { calendarApi } from "@/lib/api/calendarApi";

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
