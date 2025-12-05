import type { Middleware, Reducer } from "@reduxjs/toolkit";

import { attendanceApi } from "@/lib/api/attendanceApi";

export type RegisteredRtkApi = {
  reducerPath: string;
  reducer: Reducer;
  middleware: Middleware;
  util?: {
    resetApiState: () => unknown;
  };
};

export const rtkApis: RegisteredRtkApi[] = [attendanceApi];
