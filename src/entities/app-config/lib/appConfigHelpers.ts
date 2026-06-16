import { getWorkflowCategoryOrder } from "@entities/workflow/lib/workflowLabels";
import {
  type AppConfig,
} from "@shared/api/graphql/types";
import { resolveThemeColor } from "@shared/config/theme";
import {
  getDesignTokens,
} from "@shared/designSystem";
import { buildClockTimeDayjs } from "@shared/lib/time";

import type { ShiftGroupConfig } from "../model/shiftGroupTypes";

const DEFAULT_THEME_TOKENS = getDesignTokens();

/**
 * リンク情報の抽出
 */
export function extractLinks(links: AppConfig["links"]) {
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

/**
 * 理由情報の抽出
 */
export function extractReasons(reasons: AppConfig["reasons"]) {
  if (!reasons) return [];
  return reasons
    .filter((reason): reason is NonNullable<typeof reason> => Boolean(reason))
    .map((reason) => ({
      reason: reason.reason ?? "",
      enabled: reason.enabled ?? false,
    }));
}

/**
 * クイック入力時間の抽出
 */
export function extractQuickInputTimes(
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

/**
 * シフトグループ情報の抽出
 */
export function extractShiftGroups(groups: AppConfig["shiftGroups"]): ShiftGroupConfig[] {
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

/**
 * テーマトークンの計算
 */
export function computeThemeTokens(
  themeColor: string | null | undefined,
  brandPrimaryOverride?: string,
) {
  const hasRemoteThemeColor = Boolean(themeColor);
  const candidate = brandPrimaryOverride ?? themeColor ?? "default"; // DEFAULT_CONFIG.themeColor の代わりに文字列
  if (!brandPrimaryOverride && !hasRemoteThemeColor) return DEFAULT_THEME_TOKENS;
  const resolved = resolveThemeColor(candidate || undefined);
  if (!brandPrimaryOverride && resolved === DEFAULT_THEME_TOKENS.color.brand.primary.base) {
    return DEFAULT_THEME_TOKENS;
  }
  return getDesignTokens({ brandPrimary: resolved });
}

/**
 * テーマカラーの計算
 */
export function computeThemeColor(themeColor: string | null | undefined, fallbackColor: string): string {
  const candidate = themeColor ?? fallbackColor;
  return resolveThemeColor(candidate || undefined);
}

/**
 * タイムレコーダーアナウンスメントの計算
 */
export function computeTimeRecorderAnnouncement(
  enabled: boolean | null | undefined,
  message: string | null | undefined,
  defaultEnabled: boolean,
  defaultMessage: string,
) {
  return {
    enabled: Boolean(enabled ?? defaultEnabled),
    message: String(message ?? defaultMessage ?? ""),
  };
}

/**
 * 標準労働時間の計算
 */
export function computeStandardWorkHours(params: {
  standardWorkHours?: number | null;
  workStartTime?: string | null;
  workEndTime?: string | null;
  lunchRestStartTime?: string | null;
  lunchRestEndTime?: string | null;
}): number {
  const configured = params.standardWorkHours;
  if (typeof configured === "number") return Math.max(configured, 0);
  const start = buildClockTimeDayjs(params.workStartTime ?? undefined, "09:00");
  const end = buildClockTimeDayjs(params.workEndTime ?? undefined, "18:00");
  const lunchStart = buildClockTimeDayjs(params.lunchRestStartTime ?? undefined, "12:00");
  const lunchEnd = buildClockTimeDayjs(params.lunchRestEndTime ?? undefined, "13:00");
  const baseHours = end.diff(start, "hour", true);
  const lunchHours = Math.max(lunchEnd.diff(lunchStart, "hour", true), 0);
  return Math.max(baseHours - lunchHours, 0);
}

/**
 * シフト表示モードの解決
 */
export function resolveShiftDisplayMode(mode?: string | null): "normal" | "collaborative" {
  return mode === "collaborative" ? "collaborative" : "normal";
}

/**
 * AppConfig の派生データの構築
 */
export function buildAppConfigDerived(config: AppConfig | null, defaultValues: Partial<AppConfig>) {
  const startTime = buildClockTimeDayjs(config?.workStartTime ?? undefined, defaultValues.workStartTime as string);
  const endTime = buildClockTimeDayjs(config?.workEndTime ?? undefined, defaultValues.workEndTime ?? undefined);
  const lunchRestStartTime = buildClockTimeDayjs(config?.lunchRestStartTime ?? undefined, defaultValues.lunchRestStartTime ?? undefined);
  const lunchRestEndTime = buildClockTimeDayjs(config?.lunchRestEndTime ?? undefined, defaultValues.lunchRestEndTime ?? undefined);
  
  return {
    startTime,
    endTime,
    standardWorkHours: computeStandardWorkHours({ 
      standardWorkHours: config?.standardWorkHours, 
      workStartTime: config?.workStartTime, 
      workEndTime: config?.workEndTime, 
      lunchRestStartTime: config?.lunchRestStartTime, 
      lunchRestEndTime: config?.lunchRestEndTime 
    }),
    configId: config?.id ?? null,
    links: extractLinks(config?.links),
    reasons: extractReasons(config?.reasons),
    officeMode: config?.officeMode ?? false,
    attendanceStatisticsEnabled: config?.attendanceStatisticsEnabled ?? false,
    workflowNotificationEnabled: config?.workflowNotificationEnabled ?? false,
    timeRecorderAnnouncement: computeTimeRecorderAnnouncement(
      config?.timeRecorderAnnouncementEnabled, 
      config?.timeRecorderAnnouncementMessage,
      defaultValues.timeRecorderAnnouncementEnabled ?? false,
      defaultValues.timeRecorderAnnouncementMessage ?? "",
    ),
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
    themeColor: computeThemeColor(config?.themeColor, defaultValues.themeColor ?? ""),
    themeTokens: computeThemeTokens(config?.themeColor),
  };
}
