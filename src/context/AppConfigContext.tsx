import dayjs from "dayjs";
import { createContext } from "react";

import { CreateAppConfigInput, UpdateAppConfigInput } from "@/API";
import { DEFAULT_CONFIG } from "@/hooks/useAppConfig/useAppConfig";

type AppConfigContextProps = {
  fetchConfig: () => Promise<void>;
  saveConfig: (
    newConfig: CreateAppConfigInput | UpdateAppConfigInput
  ) => Promise<void>;
  getStartTime: () => dayjs.Dayjs;
  getEndTime: () => dayjs.Dayjs;
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
  getQuickInputStartTimes: (onlyEnabled?: boolean) => {
    time: string;
    enabled: boolean;
  }[];
  getQuickInputEndTimes: (onlyEnabled?: boolean) => {
    time: string;
    enabled: boolean;
  }[];
  getShiftGroups: () => {
    label: string;
    description?: string | null;
    min?: number | null;
    max?: number | null;
    fixed?: number | null;
  }[];
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
  getThemeColor: () => string;
};

export const AppConfigContext = createContext<AppConfigContextProps>({
  fetchConfig: async () => {
    console.log("The process is not implemented.");
  },
  saveConfig: async () => {
    console.log("The process is not implemented.");
  },
  getStartTime: () => dayjs(DEFAULT_CONFIG.workStartTime, "HH:mm"),
  getEndTime: () => dayjs(DEFAULT_CONFIG.workEndTime, "HH:mm"),
  getConfigId: () => null,
  getLinks: () => [],
  getReasons: () => [],
  getOfficeMode: () => false,
  getQuickInputStartTimes: () => [],
  getQuickInputEndTimes: () => [],
  getShiftGroups: () => [],
  getLunchRestStartTime: () =>
    dayjs(DEFAULT_CONFIG.lunchRestStartTime, "HH:mm"),
  getLunchRestEndTime: () => dayjs(DEFAULT_CONFIG.lunchRestEndTime, "HH:mm"),
  getHourlyPaidHolidayEnabled: () => false,
  getAmHolidayStartTime: () => dayjs("09:00", "HH:mm"),
  getAmHolidayEndTime: () => dayjs("12:00", "HH:mm"),
  getPmHolidayStartTime: () => dayjs("13:00", "HH:mm"),
  getPmHolidayEndTime: () => dayjs("18:00", "HH:mm"),
  getAmPmHolidayEnabled: () => false,
  getSpecialHolidayEnabled: () => false,
  getAbsentEnabled: () => false,
  // Ensure a string is always returned to satisfy the context type
  getThemeColor: () => DEFAULT_CONFIG.themeColor ?? "",
});
