import { useLazyListAttendancesByDateRangeQuery } from "@entities/attendance/api/attendanceApi";
import { getAttendancePreviousMonthToCurrentMonthRangeInput } from "@entities/attendance/lib/attendanceQueryRange";
import type { AttendanceDaily } from "@entities/attendance/model/useAttendanceDaily";
import type { Attendance } from "@shared/api/graphql/types";
import { useEffect, useState } from "react";

type UsePendingAttendanceMapParams = {
  attendanceDailyList: AttendanceDaily[];
  baseDate?: string;
};

export function usePendingAttendanceMap({
  attendanceDailyList,
  baseDate,
}: UsePendingAttendanceMapParams) {
  const [triggerListAttendancesByDateRange] =
    useLazyListAttendancesByDateRangeQuery();
  const [pendingAttendanceMap, setPendingAttendanceMap] = useState<
    Record<string, Attendance[]>
  >({});

  useEffect(() => {
    const staffIds = Array.from(
      new Set(attendanceDailyList.map((row) => row.sub)),
    );
    if (staffIds.length === 0) {
      setPendingAttendanceMap({});
      return;
    }

    let isMounted = true;
    const { startDate, endDate } =
      getAttendancePreviousMonthToCurrentMonthRangeInput(baseDate);

    void Promise.allSettled(
      staffIds.map(async (staffId) => {
        const attendances = await triggerListAttendancesByDateRange({
          staffId,
          startDate,
          endDate,
        }).unwrap();

        return [staffId, attendances] as const;
      }),
    ).then((results) => {
      if (!isMounted) {
        return;
      }

      const successfulEntries = results.flatMap((result) =>
        result.status === "fulfilled" ? [result.value] : [],
      );
      setPendingAttendanceMap(Object.fromEntries(successfulEntries));
    });

    return () => {
      isMounted = false;
    };
  }, [attendanceDailyList, baseDate, triggerListAttendancesByDateRange]);

  return pendingAttendanceMap;
}
