import dayjs from "dayjs";
import { useCallback, useMemo } from "react";

import type {
  AppConfig,
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@/API";
import { DEFAULT_THEME_COLOR } from "@/constants/theme";
import {
  useCreateAppConfigMutation,
  useGetAppConfigQuery,
  useUpdateAppConfigMutation,
} from "@/entities/app-config/api/appConfigApi";

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
  themeColor: DEFAULT_THEME_COLOR,
  shiftGroups: [],
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
        await updateAppConfig(newConfig as UpdateAppConfigInput).unwrap();
        return;
      }

      await createAppConfig(newConfig as CreateAppConfigInput).unwrap();
    },
    [createAppConfig, updateAppConfig]
  );

  const getConfigId = useCallback(() => config?.id ?? null, [config]);

  const getStartTime = useCallback(
    () => dayjs(config?.workStartTime ?? DEFAULT_CONFIG.workStartTime, "HH:mm"),
    [config]
  );

  const getEndTime = useCallback(
    () => dayjs(config?.workEndTime ?? DEFAULT_CONFIG.workEndTime, "HH:mm"),
    [config]
  );

  const getLinks = useCallback(() => {
    if (!config?.links) {
      return [];
    }

    return config.links
      .filter((link): link is NonNullable<typeof link> => Boolean(link))
      .map((link) => ({
        label: link.label ?? "",
        url: link.url ?? "",
        enabled: link.enabled ?? false,
        icon: link.icon ?? "",
      }));
  }, [config]);

  const getReasons = useCallback(() => {
    if (!config?.reasons) {
      return [];
    }

    return config.reasons
      .filter((reason): reason is NonNullable<typeof reason> => Boolean(reason))
      .map((reason) => ({
        reason: reason.reason ?? "",
        enabled: reason.enabled ?? false,
      }));
  }, [config]);

  const getOfficeMode = useCallback(
    () => config?.officeMode ?? false,
    [config]
  );

  const getQuickInputStartTimes = useCallback(
    (onlyEnabled = false) => {
      if (!config?.quickInputStartTimes) {
        return [];
      }

      return config.quickInputStartTimes
        .filter((time): time is NonNullable<typeof time> => Boolean(time))
        .filter((time) => (onlyEnabled ? Boolean(time.enabled) : true))
        .map((time) => ({
          time: time.time ?? "",
          enabled: time.enabled ?? false,
        }));
    },
    [config]
  );

  const getQuickInputEndTimes = useCallback(
    (onlyEnabled = false) => {
      if (!config?.quickInputEndTimes) {
        return [];
      }

      return config.quickInputEndTimes
        .filter((time): time is NonNullable<typeof time> => Boolean(time))
        .filter((time) => (onlyEnabled ? Boolean(time.enabled) : true))
        .map((time) => ({
          time: time.time ?? "",
          enabled: time.enabled ?? false,
        }));
    },
    [config]
  );

  const getShiftGroups = useCallback(() => {
    if (!config?.shiftGroups) {
      return [];
    }

    return config.shiftGroups
      .filter((group): group is NonNullable<typeof group> => Boolean(group))
      .map((group) => ({
        label: group.label ?? "",
        description: group.description ?? null,
        min: group.min ?? null,
        max: group.max ?? null,
        fixed: group.fixed ?? null,
      }));
  }, [config]);

  const getLunchRestStartTime = useCallback(
    () =>
      dayjs(
        config?.lunchRestStartTime ?? DEFAULT_CONFIG.lunchRestStartTime,
        "HH:mm"
      ),
    [config]
  );

  const getLunchRestEndTime = useCallback(
    () =>
      dayjs(
        config?.lunchRestEndTime ?? DEFAULT_CONFIG.lunchRestEndTime,
        "HH:mm"
      ),
    [config]
  );

  const getHourlyPaidHolidayEnabled = useCallback(
    () => config?.hourlyPaidHolidayEnabled ?? false,
    [config]
  );

  const getAmHolidayStartTime = useCallback(
    () => dayjs(config?.amHolidayStartTime ?? "09:00", "HH:mm"),
    [config]
  );

  const getAmHolidayEndTime = useCallback(
    () => dayjs(config?.amHolidayEndTime ?? "12:00", "HH:mm"),
    [config]
  );

  const getPmHolidayStartTime = useCallback(
    () => dayjs(config?.pmHolidayStartTime ?? "13:00", "HH:mm"),
    [config]
  );

  const getPmHolidayEndTime = useCallback(
    () => dayjs(config?.pmHolidayEndTime ?? "18:00", "HH:mm"),
    [config]
  );

  const getAmPmHolidayEnabled = useCallback(
    () => config?.amPmHolidayEnabled ?? false,
    [config]
  );

  const getSpecialHolidayEnabled = useCallback(
    () => config?.specialHolidayEnabled ?? false,
    [config]
  );

  const getAbsentEnabled = useCallback(
    () => config?.absentEnabled ?? false,
    [config]
  );

  const getThemeColor = useCallback(
    () =>
      config?.themeColor ?? DEFAULT_CONFIG.themeColor ?? DEFAULT_THEME_COLOR,
    [config]
  );

  const loading = useMemo(
    () => isLoading || isFetching || isCreating || isUpdating,
    [isLoading, isFetching, isCreating, isUpdating]
  );

  return {
    config,
    loading,
    fetchConfig,
    saveConfig,
    getStartTime,
    getEndTime,
    getConfigId,
    getLinks,
    getReasons,
    getOfficeMode,
    getQuickInputStartTimes,
    getQuickInputEndTimes,
    getShiftGroups,
    getLunchRestStartTime,
    getLunchRestEndTime,
    getHourlyPaidHolidayEnabled,
    getAmHolidayStartTime,
    getAmHolidayEndTime,
    getPmHolidayStartTime,
    getPmHolidayEndTime,
    getAmPmHolidayEnabled,
    getSpecialHolidayEnabled,
    getAbsentEnabled,
    getThemeColor,
  };
};

export default useAppConfig;
