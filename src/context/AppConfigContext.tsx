import type { ShiftGroupConfig } from "@entities/app-config/model/shiftGroupTypes";
import type {
  DefaultAppConfig,
  ShiftDisplayMode,
} from "@entities/app-config/model/useAppConfig";
import type { WorkflowCategoryOrderItem } from "@entities/workflow/lib/workflowLabels";
import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import type dayjs from "dayjs";
import { createContext } from "react";

import { resolveThemeColor } from "@/shared/config/theme";
import { type DesignTokens, getDesignTokens } from "@/shared/designSystem";
import { buildClockTimeDayjs } from "@/shared/lib/time";

const DEFAULT_THEME_TOKENS = getDesignTokens();
const FALLBACK_CONFIG: DefaultAppConfig = {
  name: "default",
  workStartTime: "09:00",
  workEndTime: "18:00",
  lunchRestStartTime: "12:00",
  lunchRestEndTime: "13:00",
  officeMode: false,
  links: [],
  reasons: [],
  quickInputStartTimes: [],
  quickInputEndTimes: [],
  themeColor: resolveThemeColor(),
  shiftGroups: [],
  attendanceStatisticsEnabled: false,
  workflowNotificationEnabled: false,
  timeRecorderAnnouncementEnabled: false,
  timeRecorderAnnouncementMessage: "",
  overTimeCheckEnabled: false,
  shiftCollaborativeEnabled: false,
  shiftDefaultMode: "normal",
};

type AppConfigContextProps = {
  config?: DefaultAppConfig | Record<string, unknown> | null;
  derived?: {
    startTime: dayjs.Dayjs;
    endTime: dayjs.Dayjs;
    standardWorkHours: number;
    configId: string | null;
    links: {
      label: string;
      url: string;
      enabled: boolean;
      icon: string;
    }[];
    reasons: {
      reason: string;
      enabled: boolean;
    }[];
    officeMode: boolean;
    attendanceStatisticsEnabled: boolean;
    workflowNotificationEnabled: boolean;
    timeRecorderAnnouncement: {
      enabled: boolean;
      message: string;
    };
    shiftCollaborativeEnabled: boolean;
    shiftDefaultMode: ShiftDisplayMode;
    quickInputStartTimes: {
      time: string;
      enabled: boolean;
    }[];
    quickInputEndTimes: {
      time: string;
      enabled: boolean;
    }[];
    shiftGroups: ShiftGroupConfig[];
    lunchRestStartTime: dayjs.Dayjs;
    lunchRestEndTime: dayjs.Dayjs;
    hourlyPaidHolidayEnabled: boolean;
    amHolidayStartTime: dayjs.Dayjs;
    amHolidayEndTime: dayjs.Dayjs;
    pmHolidayStartTime: dayjs.Dayjs;
    pmHolidayEndTime: dayjs.Dayjs;
    amPmHolidayEnabled: boolean;
    specialHolidayEnabled: boolean;
    absentEnabled: boolean;
    overTimeCheckEnabled: boolean;
    workflowCategoryOrder: WorkflowCategoryOrderItem[];
    themeColor: string;
    themeTokens: DesignTokens;
  };
  loading?: boolean;
  isLoading?: boolean;
  isConfigLoading?: boolean;
  refetch?: () => Promise<void>;
  save?: (
    newConfig: CreateAppConfigInput | UpdateAppConfigInput,
  ) => Promise<void>;
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
  config: FALLBACK_CONFIG,
  derived: {
    startTime: buildClockTimeDayjs(FALLBACK_CONFIG.workStartTime),
    endTime: buildClockTimeDayjs(FALLBACK_CONFIG.workEndTime),
    standardWorkHours: 8,
    configId: null,
    links: [],
    reasons: [],
    officeMode: false,
    attendanceStatisticsEnabled: false,
    workflowNotificationEnabled: false,
    timeRecorderAnnouncement: {
      enabled: false,
      message: "",
    },
    shiftCollaborativeEnabled: false,
    shiftDefaultMode: "normal",
    quickInputStartTimes: [],
    quickInputEndTimes: [],
    shiftGroups: [],
    lunchRestStartTime: buildClockTimeDayjs(FALLBACK_CONFIG.lunchRestStartTime),
    lunchRestEndTime: buildClockTimeDayjs(FALLBACK_CONFIG.lunchRestEndTime),
    hourlyPaidHolidayEnabled: false,
    amHolidayStartTime: buildClockTimeDayjs("09:00"),
    amHolidayEndTime: buildClockTimeDayjs("12:00"),
    pmHolidayStartTime: buildClockTimeDayjs("13:00"),
    pmHolidayEndTime: buildClockTimeDayjs("18:00"),
    amPmHolidayEnabled: false,
    specialHolidayEnabled: false,
    absentEnabled: false,
    overTimeCheckEnabled: false,
    workflowCategoryOrder: [],
    themeColor: FALLBACK_CONFIG.themeColor ?? "",
    themeTokens: DEFAULT_THEME_TOKENS,
  },
  loading: false,
  isLoading: false,
  isConfigLoading: false,
  refetch: async () => {
    console.log("The process is not implemented.");
  },
  save: async () => {
    console.log("The process is not implemented.");
  },
  fetchConfig: async () => {
    console.log("The process is not implemented.");
  },
  saveConfig: async () => {
    console.log("The process is not implemented.");
  },
  getStartTime: () => buildClockTimeDayjs(FALLBACK_CONFIG.workStartTime),
  getEndTime: () => buildClockTimeDayjs(FALLBACK_CONFIG.workEndTime),
  getStandardWorkHours: () => {
    const start = buildClockTimeDayjs(FALLBACK_CONFIG.workStartTime);
    const end = buildClockTimeDayjs(FALLBACK_CONFIG.workEndTime);
    const lunchStart = buildClockTimeDayjs(FALLBACK_CONFIG.lunchRestStartTime);
    const lunchEnd = buildClockTimeDayjs(FALLBACK_CONFIG.lunchRestEndTime);
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
    buildClockTimeDayjs(FALLBACK_CONFIG.lunchRestStartTime),
  getLunchRestEndTime: () =>
    buildClockTimeDayjs(FALLBACK_CONFIG.lunchRestEndTime),
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
  getThemeColor: () => FALLBACK_CONFIG.themeColor ?? "",
  getThemeTokens: () => DEFAULT_THEME_TOKENS,
});
