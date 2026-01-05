import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import { Dayjs } from "dayjs";

import { DEFAULT_CONFIG_NAME, TIME_FORMAT } from "./constants";

export const formatTime = (time: Dayjs | null): string | null =>
  time ? time.format(TIME_FORMAT) : null;

export const buildStandardWorkHours = (
  start: Dayjs | null,
  end: Dayjs | null,
  restStart: Dayjs | null,
  restEnd: Dayjs | null
): number | null => {
  if (!start || !end || !restStart || !restEnd) return null;
  const baseHours = end.diff(start, "hour", true);
  const lunchHours = Math.max(restEnd.diff(restStart, "hour", true), 0);
  return Math.max(baseHours - lunchHours, 0);
};

type OptionalTimes = {
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  lunchRestStartTime: Dayjs | null;
  lunchRestEndTime: Dayjs | null;
  amHolidayStartTime: Dayjs | null;
  amHolidayEndTime: Dayjs | null;
  pmHolidayStartTime: Dayjs | null;
  pmHolidayEndTime: Dayjs | null;
};

type BuildBasePayloadOptions = {
  links: { label: string; url: string; enabled: boolean; icon: string }[];
  reasons: { reason: string; enabled: boolean }[];
  quickInputStartTimes: { time: Dayjs; enabled: boolean }[];
  quickInputEndTimes: { time: Dayjs; enabled: boolean }[];
  officeMode: boolean;
  absentEnabled: boolean;
  hourlyPaidHolidayEnabled: boolean;
  amPmHolidayEnabled: boolean;
  specialHolidayEnabled: boolean;
  attendanceStatisticsEnabled: boolean;
};

export type BaseAppConfigPayload = {
  workStartTime?: string | null;
  workEndTime?: string | null;
  standardWorkHours?: number | null;
  links: { label: string; url: string; enabled: boolean; icon: string }[];
  reasons: { reason: string; enabled: boolean }[];
  officeMode: boolean;
  absentEnabled: boolean;
  quickInputStartTimes: { time: string; enabled: boolean }[];
  quickInputEndTimes: { time: string; enabled: boolean }[];
  lunchRestStartTime?: string | null;
  lunchRestEndTime?: string | null;
  hourlyPaidHolidayEnabled: boolean;
  amHolidayStartTime?: string | null;
  amHolidayEndTime?: string | null;
  pmHolidayStartTime?: string | null;
  pmHolidayEndTime?: string | null;
  amPmHolidayEnabled: boolean;
  specialHolidayEnabled: boolean;
  attendanceStatisticsEnabled: boolean;
};

export const buildBasePayload = (
  times: OptionalTimes,
  opts: BuildBasePayloadOptions
): BaseAppConfigPayload => ({
  workStartTime: formatTime(times.startTime),
  workEndTime: formatTime(times.endTime),
  standardWorkHours: buildStandardWorkHours(
    times.startTime,
    times.endTime,
    times.lunchRestStartTime,
    times.lunchRestEndTime
  ),
  links: opts.links.map((link) => ({
    label: link.label,
    url: link.url,
    enabled: link.enabled,
    icon: link.icon,
  })),
  reasons: opts.reasons.map((reason) => ({
    reason: reason.reason,
    enabled: reason.enabled,
  })),
  officeMode: opts.officeMode,
  absentEnabled: opts.absentEnabled,
  quickInputStartTimes: opts.quickInputStartTimes.map((entry) => ({
    time: formatTime(entry.time)!,
    enabled: entry.enabled,
  })),
  quickInputEndTimes: opts.quickInputEndTimes.map((entry) => ({
    time: formatTime(entry.time)!,
    enabled: entry.enabled,
  })),
  lunchRestStartTime: formatTime(times.lunchRestStartTime),
  lunchRestEndTime: formatTime(times.lunchRestEndTime),
  hourlyPaidHolidayEnabled: opts.hourlyPaidHolidayEnabled,
  amHolidayStartTime: formatTime(times.amHolidayStartTime),
  amHolidayEndTime: formatTime(times.amHolidayEndTime),
  pmHolidayStartTime: formatTime(times.pmHolidayStartTime),
  pmHolidayEndTime: formatTime(times.pmHolidayEndTime),
  amPmHolidayEnabled: opts.amPmHolidayEnabled,
  specialHolidayEnabled: opts.specialHolidayEnabled,
  attendanceStatisticsEnabled: opts.attendanceStatisticsEnabled,
});

/**
 * フォーム内部で扱う状態の型
 * GraphQLのCreateAppConfigInput/UpdateAppConfigInputに対応
 */
export type ConfigFormState = {
  id: string | null;
  links: { label: string; url: string; enabled: boolean; icon: string }[];
  reasons: { reason: string; enabled: boolean }[];
  quickInputStartTimes: { time: Dayjs; enabled: boolean }[];
  quickInputEndTimes: { time: Dayjs; enabled: boolean }[];
  officeMode: boolean;
  absentEnabled: boolean;
  hourlyPaidHolidayEnabled: boolean;
  amPmHolidayEnabled: boolean;
  specialHolidayEnabled: boolean;
  attendanceStatisticsEnabled: boolean;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  lunchRestStartTime: Dayjs | null;
  lunchRestEndTime: Dayjs | null;
  amHolidayStartTime: Dayjs | null;
  amHolidayEndTime: Dayjs | null;
  pmHolidayStartTime: Dayjs | null;
  pmHolidayEndTime: Dayjs | null;
};

/**
 * フォーム状態からGraphQL入力型への共通変換ロジック
 * CreateとUpdateで共通のフィールド変換を行う
 */
const transformFormStateToPayload = (
  state: Omit<ConfigFormState, "id">
): Omit<CreateAppConfigInput, "name" | "id"> => {
  return buildBasePayload(
    {
      startTime: state.startTime,
      endTime: state.endTime,
      lunchRestStartTime: state.lunchRestStartTime,
      lunchRestEndTime: state.lunchRestEndTime,
      amHolidayStartTime: state.amHolidayStartTime,
      amHolidayEndTime: state.amHolidayEndTime,
      pmHolidayStartTime: state.pmHolidayStartTime,
      pmHolidayEndTime: state.pmHolidayEndTime,
    },
    {
      links: state.links,
      reasons: state.reasons,
      quickInputStartTimes: state.quickInputStartTimes,
      quickInputEndTimes: state.quickInputEndTimes,
      officeMode: state.officeMode,
      absentEnabled: state.absentEnabled,
      hourlyPaidHolidayEnabled: state.hourlyPaidHolidayEnabled,
      amPmHolidayEnabled: state.amPmHolidayEnabled,
      specialHolidayEnabled: state.specialHolidayEnabled,
      attendanceStatisticsEnabled: state.attendanceStatisticsEnabled,
    }
  );
};

/**
 * フォーム状態から CreateAppConfigInput を生成
 * 新規作成時に使用。nameフィールドは"default"固定
 */
export const buildCreatePayload = (
  state: Omit<ConfigFormState, "id">
): CreateAppConfigInput => {
  return {
    name: DEFAULT_CONFIG_NAME,
    ...transformFormStateToPayload(state),
  };
};

/**
 * フォーム状態から UpdateAppConfigInput を生成
 * 更新時に使用。idは必須
 */
export const buildUpdatePayload = (
  state: ConfigFormState
): UpdateAppConfigInput => {
  if (!state.id) {
    throw new Error("ID is required for update payload");
  }

  return {
    id: state.id,
    ...transformFormStateToPayload(state),
  };
};
