import {
  type UpdateAppConfigPayload,
  useCreateAppConfigMutation,
  useGetAppConfigQuery,
  useUpdateAppConfigMutation,
} from "@entities/app-config/api/appConfigApi";
import {
  buildVersionOrUpdatedAtCondition,
  getNextVersion,
} from "@shared/api/graphql/concurrency";
import type {
  AppConfig,
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import { resolveThemeColor } from "@shared/config/theme";
import {
  applyDesignTokenCssVariables,
} from "@shared/designSystem";
import { useCallback, useEffect, useMemo } from "react";

import {
  buildAppConfigDerived,
  computeThemeTokens,
} from "../lib/appConfigHelpers";

export type ShiftDisplayMode = "normal" | "collaborative";

/**
 * アプリケーション設定の一部項目のみを抽出した型。
 */
export type DefaultAppConfig = Pick<
  AppConfig,
  | "name"
  | "workStartTime"
  | "workEndTime"
  | "lunchRestStartTime"
  | "lunchRestEndTime"
  | "links"
  | "officeMode"
  | "reasons"
  | "quickInputStartTimes"
  | "quickInputEndTimes"
  | "themeColor"
  | "shiftGroups"
  | "attendanceStatisticsEnabled"
  | "workflowNotificationEnabled"
  | "timeRecorderAnnouncementEnabled"
  | "timeRecorderAnnouncementMessage"
  | "overTimeCheckEnabled"
  | "shiftCollaborativeEnabled"
  | "shiftDefaultMode"
>;

/**
 * デフォルトのアプリケーション設定値。
 */
export const DEFAULT_CONFIG: DefaultAppConfig = {
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

const useAppConfig = () => {
  const {
    data: fetchedConfig,
    isLoading,
    isFetching,
    refetch,
  } = useGetAppConfigQuery({ name: "default" });
  const [createAppConfig, { isLoading: isCreating }] =
    useCreateAppConfigMutation();
  const [updateAppConfig, { isLoading: isUpdating }] =
    useUpdateAppConfigMutation();

  const config = fetchedConfig ?? null;

  /**
   * 設定をバックエンドから再取得する。
   */
  const fetchConfig = useCallback(async () => {
    await refetch();
  }, [refetch]);

  /**
   * 設定を新規作成または更新する。
   */
  const saveConfig = useCallback(
    async (newConfig: CreateAppConfigInput | UpdateAppConfigInput) => {
      if ("id" in newConfig && newConfig.id) {
        await updateAppConfig({
          input: {
            ...(newConfig as UpdateAppConfigInput),
            version: getNextVersion(config?.version),
          },
          condition: buildVersionOrUpdatedAtCondition(
            config?.version,
            config?.updatedAt,
          ),
        } satisfies UpdateAppConfigPayload).unwrap();
        return;
      }

      await createAppConfig(newConfig as CreateAppConfigInput).unwrap();
    },
    [createAppConfig, updateAppConfig, config?.version, config?.updatedAt],
  );

  useEffect(() => {
    applyDesignTokenCssVariables(computeThemeTokens(config?.themeColor));
  }, [config?.themeColor]);

  const loading = isLoading || isFetching || isCreating || isUpdating;
  const isConfigLoading = isLoading || isFetching;

  const derived = useMemo(() => buildAppConfigDerived(config, DEFAULT_CONFIG), [config, DEFAULT_CONFIG]);

  return {
    config,
    derived,
    loading,
    isConfigLoading,
    fetchConfig,
    saveConfig,
    // Derived values
    getStartTime: () => derived.startTime,
    getEndTime: () => derived.endTime,
    getStandardWorkHours: () => derived.standardWorkHours,
    getConfigId: () => derived.configId,
    getLinks: () => derived.links,
    getReasons: () => derived.reasons,
    getOfficeMode: () => derived.officeMode,
    getAttendanceStatisticsEnabled: () => derived.attendanceStatisticsEnabled,
    getWorkflowNotificationEnabled: () => derived.workflowNotificationEnabled,
    getTimeRecorderAnnouncement: () => derived.timeRecorderAnnouncement,
    getShiftCollaborativeEnabled: () => derived.shiftCollaborativeEnabled,
    getShiftDefaultMode: () => derived.shiftDefaultMode,
    getQuickInputStartTimes: (onlyEnabled = false) => 
      onlyEnabled ? derived.quickInputStartTimesEnabled : derived.quickInputStartTimes,
    getQuickInputEndTimes: (onlyEnabled = false) => 
      onlyEnabled ? derived.quickInputEndTimesEnabled : derived.quickInputEndTimes,
    getShiftGroups: () => derived.shiftGroups,
    getLunchRestStartTime: () => derived.lunchRestStartTime,
    getLunchRestEndTime: () => derived.lunchRestEndTime,
    getHourlyPaidHolidayEnabled: () => derived.hourlyPaidHolidayEnabled,
    getAmHolidayStartTime: () => derived.amHolidayStartTime,
    getAmHolidayEndTime: () => derived.amHolidayEndTime,
    getPmHolidayStartTime: () => derived.pmHolidayStartTime,
    getPmHolidayEndTime: () => derived.pmHolidayEndTime,
    getAmPmHolidayEnabled: () => derived.amPmHolidayEnabled,
    getSpecialHolidayEnabled: () => derived.specialHolidayEnabled,
    getAbsentEnabled: () => derived.absentEnabled,
    getOverTimeCheckEnabled: () => derived.overTimeCheckEnabled,
    getWorkflowCategoryOrder: () => derived.workflowCategoryOrder,
    getThemeColor: () => derived.themeColor,
    getThemeTokens: (brandPrimaryOverride?: string) => computeThemeTokens(config?.themeColor, brandPrimaryOverride),
  };
};

export default useAppConfig;