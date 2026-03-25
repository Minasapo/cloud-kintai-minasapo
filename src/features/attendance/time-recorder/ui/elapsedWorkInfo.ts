import dayjs, { type Dayjs } from "dayjs";

type RestPeriod = {
  startTime?: string | null;
  endTime?: string | null;
};

const toReferenceClockTime = (reference: Dayjs, clockTime: Dayjs) =>
  reference
    .startOf("day")
    .hour(clockTime.hour())
    .minute(clockTime.minute())
    .second(clockTime.second())
    .millisecond(clockTime.millisecond());

const getOverlapMinutes = (
  startA: Dayjs,
  endA: Dayjs,
  startB: Dayjs,
  endB: Dayjs,
) => {
  const overlapStart = startA.isAfter(startB) ? startA : startB;
  const overlapEnd = endA.isBefore(endB) ? endA : endB;

  if (!overlapEnd.isAfter(overlapStart)) {
    return 0;
  }

  return overlapEnd.diff(overlapStart, "minute");
};

export const getUnrecordedDefaultLunchMinutes = ({
  now,
  attendanceStartTime,
  rests,
  lunchRestStartTime,
  lunchRestEndTime,
}: {
  now: Dayjs;
  attendanceStartTime?: string | null;
  rests?: ReadonlyArray<RestPeriod | null> | null;
  lunchRestStartTime: Dayjs;
  lunchRestEndTime: Dayjs;
}) => {
  if (!attendanceStartTime) {
    return 0;
  }

  const workStart = dayjs(attendanceStartTime);
  if (!workStart.isValid()) {
    return 0;
  }

  const lunchStart = toReferenceClockTime(workStart, lunchRestStartTime);
  const lunchEnd = toReferenceClockTime(workStart, lunchRestEndTime);

  if (!lunchEnd.isAfter(lunchStart) || now.isBefore(lunchEnd)) {
    return 0;
  }

  const lunchWindowMinutes = getOverlapMinutes(
    workStart,
    now,
    lunchStart,
    lunchEnd,
  );
  if (lunchWindowMinutes <= 0) {
    return 0;
  }

  const recordedLunchMinutes = (rests ?? [])
    .filter((rest): rest is RestPeriod => Boolean(rest?.startTime))
    .reduce((sum, rest) => {
      const restStart = dayjs(rest.startTime);
      const restEnd = dayjs(rest.endTime ?? now);

      if (
        !restStart.isValid() ||
        !restEnd.isValid() ||
        !restEnd.isAfter(restStart)
      ) {
        return sum;
      }

      return sum + getOverlapMinutes(restStart, restEnd, lunchStart, lunchEnd);
    }, 0);

  return Math.max(lunchWindowMinutes - recordedLunchMinutes, 0);
};
