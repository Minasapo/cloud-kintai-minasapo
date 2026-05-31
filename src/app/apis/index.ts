import { appConfigApi } from "@entities/app-config/api/appConfigApi";
import { attendanceApi } from "@entities/attendance/api/attendanceApi";
import { attendanceStatisticsApi } from "@entities/attendance-statistics/api/attendanceStatisticsApi";
import { calendarApi } from "@entities/calendar/api/calendarApi";
import { shiftApi } from "@entities/shift/api/shiftApi";
import { staffApi } from "@entities/staff/api/staffApi";
import { workflowApi } from "@entities/workflow/api/workflowApi";
import { workflowTemplateApi } from "@entities/workflow-template/api/workflowTemplateApi";
import {
  collectExtensionRtkApis,
  extensionManifests,
} from "@extensions/index";
import type { Middleware, Reducer } from "@reduxjs/toolkit";

export type RegisteredRtkApi = {
  reducerPath: string;
  reducer: Reducer;
  middleware: Middleware;
  util?: {
    resetApiState: () => unknown;
  };
};

/**
 * Core RTK Query slices required by the application shell. Extension-owned
 * slices are appended in {@link rtkApis} via the extension registry.
 */
const coreRtkApis: RegisteredRtkApi[] = [
  attendanceApi,
  attendanceStatisticsApi,
  calendarApi,
  appConfigApi,
  shiftApi,
  staffApi,
  workflowApi,
  workflowTemplateApi,
];

export const rtkApis: RegisteredRtkApi[] = [
  ...coreRtkApis,
  ...collectExtensionRtkApis(extensionManifests),
];
