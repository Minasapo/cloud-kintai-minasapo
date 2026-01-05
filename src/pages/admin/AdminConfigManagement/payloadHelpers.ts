import { Dayjs } from "dayjs";

export const formatTime = (time: Dayjs) => time.format("HH:mm");

export const buildStandardWorkHours = (
  start: Dayjs,
  end: Dayjs,
  restStart: Dayjs,
  restEnd: Dayjs
) => {
  const baseHours = end.diff(start, "hour", true);
  const lunchHours = Math.max(restEnd.diff(restStart, "hour", true), 0);
  return Math.max(baseHours - lunchHours, 0);
};

type RequiredTimes = {
  startTime: Dayjs;
  endTime: Dayjs;
  lunchRestStartTime: Dayjs;
  lunchRestEndTime: Dayjs;
  amHolidayStartTime: Dayjs;
  amHolidayEndTime: Dayjs;
  pmHolidayStartTime: Dayjs;
  pmHolidayEndTime: Dayjs;
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
  workStartTime: string;
  workEndTime: string;
  standardWorkHours: number;
  links: { label: string; url: string; enabled: boolean; icon: string }[];
  reasons: { reason: string; enabled: boolean }[];
  officeMode: boolean;
  absentEnabled: boolean;
  quickInputStartTimes: { time: string; enabled: boolean }[];
  quickInputEndTimes: { time: string; enabled: boolean }[];
  lunchRestStartTime: string;
  lunchRestEndTime: string;
  hourlyPaidHolidayEnabled: boolean;
  amHolidayStartTime: string;
  amHolidayEndTime: string;
  pmHolidayStartTime: string;
  pmHolidayEndTime: string;
  amPmHolidayEnabled: boolean;
  specialHolidayEnabled: boolean;
  attendanceStatisticsEnabled: boolean;
};

export const buildBasePayload = (
  requiredTimes: RequiredTimes,
  opts: BuildBasePayloadOptions
): BaseAppConfigPayload => ({
  workStartTime: formatTime(requiredTimes.startTime),
  workEndTime: formatTime(requiredTimes.endTime),
  standardWorkHours: buildStandardWorkHours(
    requiredTimes.startTime,
    requiredTimes.endTime,
    requiredTimes.lunchRestStartTime,
    requiredTimes.lunchRestEndTime
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
    time: formatTime(entry.time),
    enabled: entry.enabled,
  })),
  quickInputEndTimes: opts.quickInputEndTimes.map((entry) => ({
    time: formatTime(entry.time),
    enabled: entry.enabled,
  })),
  lunchRestStartTime: formatTime(requiredTimes.lunchRestStartTime),
  lunchRestEndTime: formatTime(requiredTimes.lunchRestEndTime),
  hourlyPaidHolidayEnabled: opts.hourlyPaidHolidayEnabled,
  amHolidayStartTime: formatTime(requiredTimes.amHolidayStartTime),
  amHolidayEndTime: formatTime(requiredTimes.amHolidayEndTime),
  pmHolidayStartTime: formatTime(requiredTimes.pmHolidayStartTime),
  pmHolidayEndTime: formatTime(requiredTimes.pmHolidayEndTime),
  amPmHolidayEnabled: opts.amPmHolidayEnabled,
  specialHolidayEnabled: opts.specialHolidayEnabled,
  attendanceStatisticsEnabled: opts.attendanceStatisticsEnabled,
});
