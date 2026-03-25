import dayjs from "dayjs";

import { AttendanceState, AttendanceStatus } from "@/entities/attendance/lib/AttendanceState";
import { Attendance, Staff } from "@/shared/api/graphql/types";

import { WorkStatus, WorkStatusCodes } from "../lib/common";
import { getUnrecordedDefaultLunchMinutes } from "./elapsedWorkInfo";

export type TimeRecorderElapsedWorkInfo = {
  visible: boolean;
  workDurationLabel: string;
  restDurationLabel: string;
};

const DEFAULT_ELAPSED_WORK_INFO: TimeRecorderElapsedWorkInfo = {
  visible: false,
  workDurationLabel: "00:00",
  restDurationLabel: "00:00",
};

type HolidayCalendarsArg = ConstructorParameters<typeof AttendanceState>[2];
type CompanyHolidayCalendarsArg = ConstructorParameters<typeof AttendanceState>[3];

function formatElapsedDurationFromMinutes(totalMinutes: number): string {
  const safeMinutes = Math.max(0, Math.floor(totalMinutes));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function calcElapsedMinutes(
  startTime: string | null | undefined,
  endTime?: string | null | undefined,
): number {
  if (!startTime) {
    return 0;
  }

  return Math.max(
    dayjs(endTime ?? dayjs()).diff(dayjs(startTime), "minute"),
    0,
  );
}

export function hasPendingChangeRequests(
  attendance: Attendance | null | undefined,
): boolean {
  return (attendance?.changeRequests ?? [])
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .some((item) => !item.completed);
}

export function formatClockDisplayText(
  time: string | null | undefined,
  suffix: "出勤" | "退勤",
): string | null {
  if (!time) {
    return null;
  }
  return `${dayjs(time).format("HH:mm")} ${suffix}`;
}

export function toConfiguredTimeISO(
  baseIsoString: string,
  configuredTime: dayjs.Dayjs,
): string {
  return dayjs(baseIsoString)
    .hour(configuredTime.hour())
    .minute(configuredTime.minute())
    .second(0)
    .millisecond(0)
    .toISOString();
}

function resolveAttendanceStatus(params: {
  staff: Staff;
  attendance: Attendance;
  holidayCalendars: HolidayCalendarsArg;
  companyHolidayCalendars: CompanyHolidayCalendarsArg;
}): AttendanceStatus {
  return new AttendanceState(
    params.staff,
    params.attendance,
    params.holidayCalendars,
    params.companyHolidayCalendars,
  ).get();
}

export function summarizeAttendanceErrors(params: {
  staff: Staff;
  attendances: Attendance[];
  holidayCalendars: HolidayCalendarsArg;
  companyHolidayCalendars: CompanyHolidayCalendarsArg;
}): { errorCount: number; hasTimeElapsedError: boolean } {
  return params.attendances.reduce<{ errorCount: number; hasTimeElapsedError: boolean }>(
    (acc, attendance) => {
      const status = resolveAttendanceStatus({
        staff: params.staff,
        attendance,
        holidayCalendars: params.holidayCalendars,
        companyHolidayCalendars: params.companyHolidayCalendars,
      });

      if (status !== AttendanceStatus.Error) {
        return acc;
      }

      const isAfterOneWeek = dayjs().isAfter(
        dayjs(attendance.workDate).add(1, "week"),
      );

      return {
        errorCount: acc.errorCount + 1,
        hasTimeElapsedError: acc.hasTimeElapsedError || isAfterOneWeek,
      };
    },
    { errorCount: 0, hasTimeElapsedError: false },
  );
}

export function resolveElapsedWorkInfo(params: {
  attendance: Attendance | null | undefined;
  workStatus: WorkStatus | null | undefined;
  now: dayjs.Dayjs;
  lunchRestStartTime: dayjs.Dayjs;
  lunchRestEndTime: dayjs.Dayjs;
}): TimeRecorderElapsedWorkInfo {
  const { attendance, workStatus } = params;
  if (!attendance?.startTime || !workStatus) {
    return DEFAULT_ELAPSED_WORK_INFO;
  }

  if (
    workStatus.code !== WorkStatusCodes.WORKING &&
    workStatus.code !== WorkStatusCodes.RESTING
  ) {
    return DEFAULT_ELAPSED_WORK_INFO;
  }

  const rests = (attendance.rests ?? []).filter(
    (rest): rest is NonNullable<typeof rest> => rest !== null,
  );
  const grossWorkMinutes = calcElapsedMinutes(attendance.startTime);
  const totalRestMinutes = rests.reduce((sum, rest) => {
    if (!rest.startTime) {
      return sum;
    }
    return sum + calcElapsedMinutes(rest.startTime, rest.endTime);
  }, 0);

  const defaultLunchMinutes = getUnrecordedDefaultLunchMinutes({
    now: params.now,
    attendanceStartTime: attendance.startTime,
    rests: attendance.rests,
    lunchRestStartTime: params.lunchRestStartTime,
    lunchRestEndTime: params.lunchRestEndTime,
  });

  const netWorkMinutes = Math.max(
    grossWorkMinutes - totalRestMinutes - defaultLunchMinutes,
    0,
  );
  const activeRest = rests.reduce<NonNullable<Attendance["rests"]>[number] | null>(
    (latest, rest) => {
      if (!rest.startTime || rest.endTime) {
        return latest;
      }
      if (!latest?.startTime) {
        return rest;
      }
      return dayjs(rest.startTime).isAfter(dayjs(latest.startTime))
        ? rest
        : latest;
    },
    null,
  );
  const activeRestMinutes =
    workStatus.code === WorkStatusCodes.RESTING && activeRest?.startTime
      ? calcElapsedMinutes(activeRest.startTime)
      : 0;

  return {
    visible: true,
    workDurationLabel: formatElapsedDurationFromMinutes(netWorkMinutes),
    restDurationLabel: formatElapsedDurationFromMinutes(activeRestMinutes),
  };
}
