import type { Middleware, Reducer } from "@reduxjs/toolkit";

import { appConfigApi } from "@/lib/api/appConfigApi";
import { attendanceApi } from "@/lib/api/attendanceApi";
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
