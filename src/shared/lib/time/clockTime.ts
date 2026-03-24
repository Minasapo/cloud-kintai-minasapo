import dayjs, { type Dayjs } from "dayjs";

type ClockTime = {
  hour: number;
  minute: number;
};

const CLOCK_TIME_PATTERN = /^(\d{1,2}):([0-5]\d)$/;

const parseClockTime = (value: string | null | undefined): ClockTime | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  const match = CLOCK_TIME_PATTERN.exec(trimmed);
  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return null;
  }
  if (hour < 0 || hour > 23) {
    return null;
  }

  return { hour, minute };
};

export const buildClockTimeDayjs = (
  value: string | null | undefined,
  fallback = "00:00",
): Dayjs => {
  const resolved = parseClockTime(value) ?? parseClockTime(fallback) ?? {
    hour: 0,
    minute: 0,
  };
  return dayjs()
    .hour(resolved.hour)
    .minute(resolved.minute)
    .second(0)
    .millisecond(0);
};
