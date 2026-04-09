import { appConfigApi } from "@entities/app-config/api/appConfigApi";
import { attendanceApi } from "@entities/attendance/api/attendanceApi";
import { attendanceStatisticsApi } from "@entities/attendance-statistics/api/attendanceStatisticsApi";
import { calendarApi } from "@entities/calendar/api/calendarApi";
import { shiftApi } from "@entities/shift/api/shiftApi";
import { staffApi } from "@entities/staff/api/staffApi";
import { workflowApi } from "@entities/workflow/api/workflowApi";
import { workflowTemplateApi } from "@entities/workflow-template/api/workflowTemplateApi";
import type { Middleware, Reducer } from "@reduxjs/toolkit";

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
  attendanceStatisticsApi,
  calendarApi,
  appConfigApi,
  shiftApi,
  staffApi,
  workflowApi,
  workflowTemplateApi,
];
