import {
  type UpdateAppConfigPayload,
  useCreateAppConfigMutation,
  useGetAppConfigQuery,
  useUpdateAppConfigMutation,
} from "@entities/app-config/api/appConfigApi";
import { getWorkflowCategoryOrder } from "@entities/workflow/lib/workflowLabels";
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
  getDesignTokens,
} from "@shared/designSystem";
import { buildClockTimeDayjs } from "@shared/lib/time";
import { useCallback, useEffect, useMemo } from "react";

import type { ShiftGroupConfig } from "./shiftGroupTypes";

export type ShiftDisplayMode = "normal" | "collaborative";

const DEFAULT_THEME_TOKENS = getDesignTokens();

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

function extractLinks(links: AppConfig["links"]) {
  if (!links) return [];
  return links
    .filter((link): link is NonNullable<typeof link> => Boolean(link))
    .map((link) => ({
      label: link.label ?? "",
      url: link.url ?? "",
      enabled: link.enabled ?? false,
      icon: link.icon ?? "",
    }));
}

function extractReasons(reasons: AppConfig["reasons"]) {
  if (!reasons) return [];
  return reasons
    .filter((reason): reason is NonNullable<typeof reason> => Boolean(reason))
    .map((reason) => ({
      reason: reason.reason ?? "",
      enabled: reason.enabled ?? false,
    }));
}

function extractQuickInputTimes(
  times: AppConfig["quickInputStartTimes"] | AppConfig["quickInputEndTimes"],
  onlyEnabled = false,
) {
  if (!times) return [];
  return times
    .filter((time): time is NonNullable<typeof time> => Boolean(time))
    .filter((time) => (onlyEnabled ? Boolean(time.enabled) : true))
    .map((time) => ({
      time: time.time ?? "",
      enabled: time.enabled ?? false,
    }));
}

function extractShiftGroups(groups: AppConfig["shiftGroups"]): ShiftGroupConfig[] {
  if (!groups) return [];
  return groups
    .filter((group): group is NonNullable<typeof group> => Boolean(group))
    .map((group) => ({
      label: group.label ?? "",
      description: group.description ?? null,
      min: group.min ?? null,
      max: group.max ?? null,
      fixed: group.fixed ?? null,
    }));
}

function computeThemeTokens(
  themeColor: string | null | undefined,
  brandPrimaryOverride?: string,
) {
  const hasRemoteThemeColor = Boolean(themeColor);
  const candidate = brandPrimaryOverride ?? themeColor ?? DEFAULT_CONFIG.themeColor;
  if (!brandPrimaryOverride && !hasRemoteThemeColor) return DEFAULT_THEME_TOKENS;
  const resolved = resolveThemeColor(candidate || undefined);
  if (!brandPrimaryOverride && resolved === DEFAULT_THEME_TOKENS.color.brand.primary.base) {
    return DEFAULT_THEME_TOKENS;
  }
  return getDesignTokens({ brandPrimary: resolved });
}

function computeThemeColor(themeColor: string | null | undefined): string {
  const fallbackColor = DEFAULT_CONFIG.themeColor;
  const candidate = themeColor ?? fallbackColor;
  return resolveThemeColor(candidate || undefined);
}

function computeTimeRecorderAnnouncement(
  enabled: boolean | null | undefined,
  message: string | null | undefined,
) {
  return {
    enabled: Boolean(enabled ?? DEFAULT_CONFIG.timeRecorderAnnouncementEnabled),
    message: String(message ?? DEFAULT_CONFIG.timeRecorderAnnouncementMessage ?? ""),
  };
}

function computeStandardWorkHours(params: {
  standardWorkHours?: number | null;
  workStartTime?: string | null;
  workEndTime?: string | null;
  lunchRestStartTime?: string | null;
  lunchRestEndTime?: string | null;
}): number {
  const configured = params.standardWorkHours;
  if (typeof configured === "number") return Math.max(configured, 0);
  const start = buildClockTimeDayjs(params.workStartTime ?? undefined, DEFAULT_CONFIG.workStartTime ?? "09:00");
  const end = buildClockTimeDayjs(params.workEndTime ?? undefined, DEFAULT_CONFIG.workEndTime ?? "18:00");
  const lunchStart = buildClockTimeDayjs(params.lunchRestStartTime ?? undefined, DEFAULT_CONFIG.lunchRestStartTime ?? "12:00");
  const lunchEnd = buildClockTimeDayjs(params.lunchRestEndTime ?? undefined, DEFAULT_CONFIG.lunchRestEndTime ?? "13:00");
  const baseHours = end.diff(start, "hour", true);
  const lunchHours = Math.max(lunchEnd.diff(lunchStart, "hour", true), 0);
  return Math.max(baseHours - lunchHours, 0);
}

function resolveShiftDisplayMode(mode?: string | null): ShiftDisplayMode {
  return mode === "collaborative" ? "collaborative" : "normal";
}

function buildAppConfigDerived(config: AppConfig | null) {
  const startTime = buildClockTimeDayjs(config?.workStartTime ?? undefined, DEFAULT_CONFIG.workStartTime ?? "09:00");
  const endTime = buildClockTimeDayjs(config?.workEndTime ?? undefined, DEFAULT_CONFIG.workEndTime ?? "18:00");
  const lunchRestStartTime = buildClockTimeDayjs(config?.lunchRestStartTime ?? undefined, DEFAULT_CONFIG.lunchRestStartTime ?? "12:00");
  const lunchRestEndTime = buildClockTimeDayjs(config?.lunchRestEndTime ?? undefined, DEFAULT_CONFIG.lunchRestEndTime ?? "13:00");
  return {
    startTime,
    endTime,
    standardWorkHours: computeStandardWorkHours({ standardWorkHours: config?.standardWorkHours, workStartTime: config?.workStartTime, workEndTime: config?.workEndTime, lunchRestStartTime: config?.lunchRestStartTime, lunchRestEndTime: config?.lunchRestEndTime }),
    configId: config?.id ?? null,
    links: extractLinks(config?.links),
    reasons: extractReasons(config?.reasons),
    officeMode: config?.officeMode ?? false,
    attendanceStatisticsEnabled: config?.attendanceStatisticsEnabled ?? false,
    workflowNotificationEnabled: config?.workflowNotificationEnabled ?? false,
    timeRecorderAnnouncement: computeTimeRecorderAnnouncement(config?.timeRecorderAnnouncementEnabled, config?.timeRecorderAnnouncementMessage),
    shiftCollaborativeEnabled: config?.shiftCollaborativeEnabled ?? false,
    shiftDefaultMode: resolveShiftDisplayMode(config?.shiftDefaultMode),
    quickInputStartTimes: extractQuickInputTimes(config?.quickInputStartTimes),
    quickInputStartTimesEnabled: extractQuickInputTimes(config?.quickInputStartTimes, true),
    quickInputEndTimes: extractQuickInputTimes(config?.quickInputEndTimes),
    quickInputEndTimesEnabled: extractQuickInputTimes(config?.quickInputEndTimes, true),
    shiftGroups: extractShiftGroups(config?.shiftGroups),
    lunchRestStartTime,
    lunchRestEndTime,
    hourlyPaidHolidayEnabled: config?.hourlyPaidHolidayEnabled ?? false,
    amHolidayStartTime: buildClockTimeDayjs(config?.amHolidayStartTime, "09:00"),
    amHolidayEndTime: buildClockTimeDayjs(config?.amHolidayEndTime, "12:00"),
    pmHolidayStartTime: buildClockTimeDayjs(config?.pmHolidayStartTime, "13:00"),
    pmHolidayEndTime: buildClockTimeDayjs(config?.pmHolidayEndTime, "18:00"),
    amPmHolidayEnabled: config?.amPmHolidayEnabled ?? false,
    specialHolidayEnabled: config?.specialHolidayEnabled ?? false,
    absentEnabled: config?.absentEnabled ?? false,
    overTimeCheckEnabled: config?.overTimeCheckEnabled ?? false,
    workflowCategoryOrder: getWorkflowCategoryOrder(config),
    themeColor: computeThemeColor(config?.themeColor),
    themeTokens: computeThemeTokens(config?.themeColor),
  };
}

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
    [createAppConfig, updateAppConfig],
  );

  const getConfigId = useCallback(() => config?.id ?? null, [config?.id]);

  const getStartTime = useCallback(
    () =>
      buildClockTimeDayjs(
        config?.workStartTime ?? undefined,
        DEFAULT_CONFIG.workStartTime ?? "09:00",
      ),
    [config?.workStartTime],
  );

  const getEndTime = useCallback(
    () =>
      buildClockTimeDayjs(
        config?.workEndTime ?? undefined,
        DEFAULT_CONFIG.workEndTime ?? "18:00",
      ),
    [config?.workEndTime],
  );

  const getLunchRestStartTime = useCallback(
    () =>
      buildClockTimeDayjs(
        config?.lunchRestStartTime ?? undefined,
        DEFAULT_CONFIG.lunchRestStartTime ?? "12:00",
      ),
    [config?.lunchRestStartTime],
  );

  const getLunchRestEndTime = useCallback(
    () =>
      buildClockTimeDayjs(
        config?.lunchRestEndTime ?? undefined,
        DEFAULT_CONFIG.lunchRestEndTime ?? "13:00",
      ),
    [config?.lunchRestEndTime],
  );

  const getStandardWorkHours = useCallback(
    () => computeStandardWorkHours({ standardWorkHours: config?.standardWorkHours, workStartTime: config?.workStartTime, workEndTime: config?.workEndTime, lunchRestStartTime: config?.lunchRestStartTime, lunchRestEndTime: config?.lunchRestEndTime }),
    [config?.standardWorkHours, config?.workStartTime, config?.workEndTime, config?.lunchRestStartTime, config?.lunchRestEndTime],
  );

  const getLinks = useCallback(() => extractLinks(config?.links), [config?.links]);

  const getReasons = useCallback(() => extractReasons(config?.reasons), [config?.reasons]);

  const getOfficeMode = useCallback(
    () => config?.officeMode ?? false,
    [config?.officeMode],
  );

  const getAttendanceStatisticsEnabled = useCallback(
    () => config?.attendanceStatisticsEnabled ?? false,
    [config?.attendanceStatisticsEnabled],
  );

  const getWorkflowNotificationEnabled = useCallback(
    () => config?.workflowNotificationEnabled ?? false,
    [config?.workflowNotificationEnabled],
  );

  const getTimeRecorderAnnouncement = useCallback(
    () => computeTimeRecorderAnnouncement(config?.timeRecorderAnnouncementEnabled, config?.timeRecorderAnnouncementMessage),
    [config?.timeRecorderAnnouncementEnabled, config?.timeRecorderAnnouncementMessage],
  );

  const getShiftCollaborativeEnabled = useCallback(
    () => config?.shiftCollaborativeEnabled ?? false,
    [config?.shiftCollaborativeEnabled],
  );

  const getShiftDefaultMode = useCallback(
    (): ShiftDisplayMode => resolveShiftDisplayMode(config?.shiftDefaultMode),
    [config?.shiftDefaultMode],
  );

  const getQuickInputStartTimes = useCallback(
    (onlyEnabled = false) => extractQuickInputTimes(config?.quickInputStartTimes, onlyEnabled),
    [config?.quickInputStartTimes],
  );

  const getQuickInputEndTimes = useCallback(
    (onlyEnabled = false) => extractQuickInputTimes(config?.quickInputEndTimes, onlyEnabled),
    [config?.quickInputEndTimes],
  );

  const getShiftGroups = useCallback(
    (): ShiftGroupConfig[] => extractShiftGroups(config?.shiftGroups),
    [config?.shiftGroups],
  );

  const getHourlyPaidHolidayEnabled = useCallback(
    () => config?.hourlyPaidHolidayEnabled ?? false,
    [config?.hourlyPaidHolidayEnabled],
  );

  const getAmHolidayStartTime = useCallback(
    () => buildClockTimeDayjs(config?.amHolidayStartTime, "09:00"),
    [config?.amHolidayStartTime],
  );

  const getAmHolidayEndTime = useCallback(
    () => buildClockTimeDayjs(config?.amHolidayEndTime, "12:00"),
    [config?.amHolidayEndTime],
  );

  const getPmHolidayStartTime = useCallback(
    () => buildClockTimeDayjs(config?.pmHolidayStartTime, "13:00"),
    [config?.pmHolidayStartTime],
  );

  const getPmHolidayEndTime = useCallback(
    () => buildClockTimeDayjs(config?.pmHolidayEndTime, "18:00"),
    [config?.pmHolidayEndTime],
  );

  const getAmPmHolidayEnabled = useCallback(
    () => config?.amPmHolidayEnabled ?? false,
    [config?.amPmHolidayEnabled],
  );

  const getSpecialHolidayEnabled = useCallback(
    () => config?.specialHolidayEnabled ?? false,
    [config?.specialHolidayEnabled],
  );

  const getAbsentEnabled = useCallback(
    () => config?.absentEnabled ?? false,
    [config?.absentEnabled],
  );

  const getOverTimeCheckEnabled = useCallback(
    () => config?.overTimeCheckEnabled ?? false,
    [config?.overTimeCheckEnabled],
  );

  const getWorkflowCategoryOrderFromConfig = useCallback(
    () => getWorkflowCategoryOrder(config),
    [config],
  );

  const getThemeColor = useCallback(
    () => computeThemeColor(config?.themeColor),
    [config?.themeColor],
  );

  const getThemeTokens = useCallback(
    (brandPrimaryOverride?: string) => computeThemeTokens(config?.themeColor, brandPrimaryOverride),
    [config?.themeColor],
  );

  useEffect(() => {
    applyDesignTokenCssVariables(computeThemeTokens(config?.themeColor));
  }, [config?.themeColor]);

  const loading = isLoading || isFetching || isCreating || isUpdating;
  const isConfigLoading = isLoading || isFetching;

  const derived = useMemo(() => buildAppConfigDerived(config), [config, loading]);

  return {
    config,
    derived,
    loading,
    isConfigLoading,
    fetchConfig,
    saveConfig,
    getStartTime,
    getEndTime,
    getStandardWorkHours,
    getConfigId,
    getLinks,
    getReasons,
    getOfficeMode,
    getAttendanceStatisticsEnabled,
    getWorkflowNotificationEnabled,
    getTimeRecorderAnnouncement,
    getShiftCollaborativeEnabled,
    getShiftDefaultMode,
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
    getOverTimeCheckEnabled,
    getWorkflowCategoryOrder: getWorkflowCategoryOrderFromConfig,
    getThemeColor,
    getThemeTokens,
  };
};

export default useAppConfig;
