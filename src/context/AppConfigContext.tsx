import type { ShiftGroupConfig } from "@entities/app-config/model/shiftGroupTypes";
import type { ShiftDisplayMode } from "@entities/app-config/model/useAppConfig";
import { DEFAULT_CONFIG } from "@entities/app-config/model/useAppConfig";
import type { WorkflowCategoryOrderItem } from "@entities/workflow/lib/workflowLabels";
import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import type dayjs from "dayjs";
import { createContext } from "react";

import { type DesignTokens, getDesignTokens } from "@/shared/designSystem";
import { buildClockTimeDayjs } from "@/shared/lib/time";

const DEFAULT_THEME_TOKENS = getDesignTokens();

type AppConfigContextProps = {
  fetchConfig: () => Promise<void>;
  saveConfig: (
    newConfig: CreateAppConfigInput | UpdateAppConfigInput,
  ) => Promise<void>;
  getStartTime: () => dayjs.Dayjs;
  getEndTime: () => dayjs.Dayjs;
  getStandardWorkHours: () => number;
  getConfigId: () => string | null;
  getLinks: () => {
    label: string;
    url: string;
    enabled: boolean;
    icon: string;
  }[];
  getReasons: () => {
    reason: string;
    enabled: boolean;
  }[];
  getOfficeMode: () => boolean;
  getAttendanceStatisticsEnabled: () => boolean;
  getWorkflowNotificationEnabled: () => boolean;
  getTimeRecorderAnnouncement: () => {
    enabled: boolean;
    message: string;
  };
  getShiftCollaborativeEnabled: () => boolean;
  getShiftDefaultMode: () => ShiftDisplayMode;
  getQuickInputStartTimes: (onlyEnabled?: boolean) => {
    time: string;
    enabled: boolean;
  }[];
  getQuickInputEndTimes: (onlyEnabled?: boolean) => {
    time: string;
    enabled: boolean;
  }[];
  getShiftGroups: () => ShiftGroupConfig[];
  getLunchRestStartTime: () => dayjs.Dayjs;
  getLunchRestEndTime: () => dayjs.Dayjs;
  getHourlyPaidHolidayEnabled: () => boolean;
  getAmHolidayStartTime: () => dayjs.Dayjs;
  getAmHolidayEndTime: () => dayjs.Dayjs;
  getPmHolidayStartTime: () => dayjs.Dayjs;
  getPmHolidayEndTime: () => dayjs.Dayjs;
  getAmPmHolidayEnabled: () => boolean;
  getSpecialHolidayEnabled?: () => boolean;
  getAbsentEnabled?: () => boolean;
  getOverTimeCheckEnabled?: () => boolean;
  getWorkflowCategoryOrder: () => WorkflowCategoryOrderItem[];
  getThemeColor: () => string;
  getThemeTokens: (brandPrimaryOverride?: string) => DesignTokens;
};

export const AppConfigContext = createContext<AppConfigContextProps>({
  fetchConfig: async () => {
    console.log("The process is not implemented.");
  },
  saveConfig: async () => {
    console.log("The process is not implemented.");
  },
  getStartTime: () => buildClockTimeDayjs(DEFAULT_CONFIG.workStartTime),
  getEndTime: () => buildClockTimeDayjs(DEFAULT_CONFIG.workEndTime),
  getStandardWorkHours: () => {
    const start = buildClockTimeDayjs(DEFAULT_CONFIG.workStartTime);
    const end = buildClockTimeDayjs(DEFAULT_CONFIG.workEndTime);
    const lunchStart = buildClockTimeDayjs(DEFAULT_CONFIG.lunchRestStartTime);
    const lunchEnd = buildClockTimeDayjs(DEFAULT_CONFIG.lunchRestEndTime);
    const baseHours = end.diff(start, "hour", true);
    const lunchHours = Math.max(lunchEnd.diff(lunchStart, "hour", true), 0);
    return Math.max(baseHours - lunchHours, 0);
  },
  getConfigId: () => null,
  getLinks: () => [],
  getReasons: () => [],
  getOfficeMode: () => false,
  getAttendanceStatisticsEnabled: () => false,
  getWorkflowNotificationEnabled: () => false,
  getTimeRecorderAnnouncement: () => ({
    enabled: false,
    message: "",
  }),
  getShiftCollaborativeEnabled: () => false,
  getShiftDefaultMode: () => "normal",
  getQuickInputStartTimes: () => [],
  getQuickInputEndTimes: () => [],
  getShiftGroups: () => [],
  getLunchRestStartTime: () =>
    buildClockTimeDayjs(DEFAULT_CONFIG.lunchRestStartTime),
  getLunchRestEndTime: () =>
    buildClockTimeDayjs(DEFAULT_CONFIG.lunchRestEndTime),
  getHourlyPaidHolidayEnabled: () => false,
  getAmHolidayStartTime: () => buildClockTimeDayjs("09:00"),
  getAmHolidayEndTime: () => buildClockTimeDayjs("12:00"),
  getPmHolidayStartTime: () => buildClockTimeDayjs("13:00"),
  getPmHolidayEndTime: () => buildClockTimeDayjs("18:00"),
  getAmPmHolidayEnabled: () => false,
  getSpecialHolidayEnabled: () => false,
  getAbsentEnabled: () => false,
  getOverTimeCheckEnabled: () => false,
  getWorkflowCategoryOrder: () => [],
  // Ensure a string is always returned to satisfy the context type
  getThemeColor: () => DEFAULT_CONFIG.themeColor ?? "",
  getThemeTokens: () => DEFAULT_THEME_TOKENS,
});
