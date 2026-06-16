import { useMemo } from "react";
import { type UseFormWatch } from "react-hook-form";

import { calcTotalHourlyPaidHolidayTime } from "../ui/items/HourlyPaidHolidayTimeItem";
import { calcTotalRestTime } from "../ui/items/RestTimeItem/RestTimeItem";
import { calcTotalWorkTime } from "../ui/items/WorkTimeItem/WorkTimeItem";
import { type AttendanceEditInputs } from "./common";

export const useAttendanceEditorTimeSummary = (watch: UseFormWatch<AttendanceEditInputs>) => {
  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form's watch() is not a React hook
  const watchedEndTime = watch("endTime");
  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form's watch() is not a React hook
  const watchedStartTime = watch("startTime");
  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form's watch() is not a React hook
  const watchedRests = watch("rests");
  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form's watch() is not a React hook
  const watchedHourlyPaidHolidayTimes = watch("hourlyPaidHolidayTimes");

  const totalWorkTime = useMemo(() => {
    if (!watchedEndTime) return 0;
    return calcTotalWorkTime(watchedStartTime, watchedEndTime);
  }, [watchedStartTime, watchedEndTime]);

  const totalRestTime = useMemo(
    () =>
      watchedRests?.reduce((acc, rest) => {
        if (!rest) return acc;
        if (!rest.endTime) return acc;
        return acc + calcTotalRestTime(rest.startTime, rest.endTime);
      }, 0) ?? 0,
    [watchedRests],
  );

  const totalProductionTime = useMemo(
    () => totalWorkTime - totalRestTime,
    [totalWorkTime, totalRestTime],
  );

  const totalHourlyPaidHolidayTime = useMemo(
    () =>
      watchedHourlyPaidHolidayTimes?.reduce((acc, time) => {
        if (!time) return acc;
        if (!time.endTime) return acc;
        return acc + calcTotalHourlyPaidHolidayTime(time.startTime, time.endTime);
      }, 0) ?? 0,
    [watchedHourlyPaidHolidayTimes],
  );

  const isOnBreak = useMemo(
    () =>
      !!(
        watchedStartTime &&
        watchedRests &&
        watchedRests.length > 0 &&
        watchedRests[0]?.startTime &&
        !watchedRests[0]?.endTime
      ),
    [watchedStartTime, watchedRests],
  );

  return { watchedEndTime, totalProductionTime, totalHourlyPaidHolidayTime, isOnBreak };
};