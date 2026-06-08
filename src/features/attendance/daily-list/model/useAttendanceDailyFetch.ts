import { useLazyListAttendancesByDateRangeQuery } from "@entities/attendance/api/attendanceApi";
import { getAttendanceMonthRangeInput } from "@entities/attendance/lib/attendanceQueryRange";
import {
  AttendanceDaily,
  DuplicateAttendanceDaily,
} from "@entities/attendance/model/useAttendanceDaily";
import { Attendance } from "@shared/api/graphql/types";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  buildDuplicateInfoByStaff,
  mergeDuplicateAttendances,
  parseDuplicateListFromError,
} from "../lib/duplicateAttendanceUtils";
import { calculateTotalOvertimeMinutes } from "../lib/overtimeUtils";

type UseAttendanceDailyFetchParams = {
  attendanceDailyList: AttendanceDaily[];
  displayDateFormatted: string | undefined;
  staffNameMap: Record<string, string>;
  scheduledHour: number;
  scheduledMinute: number;
  duplicateAttendances: DuplicateAttendanceDaily[];
  loading: boolean;
};

type UseAttendanceDailyFetchResult = {
  attendanceMap: Record<string, Attendance[]>;
  attendanceLoadingMap: Record<string, boolean>;
  attendanceErrorMap: Record<string, Error | null>;
  duplicateSummaryMap: Record<string, DuplicateAttendanceDaily[]>;
  getAttendanceForDisplayDate: (row: AttendanceDaily) => Attendance | null;
  overtimeMinutesMap: Record<string, number>;
  getOvertimeMinutes: (row: AttendanceDaily) => number;
  summaryDuplicateList: DuplicateAttendanceDaily[];
  mergedDuplicateAttendances: DuplicateAttendanceDaily[];
  duplicateInfoByStaff: Record<string, DuplicateAttendanceDaily[]>;
};

export function useAttendanceDailyFetch({
  attendanceDailyList,
  displayDateFormatted,
  staffNameMap,
  scheduledHour,
  scheduledMinute,
  duplicateAttendances,
  loading,
}: UseAttendanceDailyFetchParams): UseAttendanceDailyFetchResult {
  const [triggerListAttendancesByDateRange] =
    useLazyListAttendancesByDateRangeQuery();

  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, Attendance[]>
  >({});
  const [attendanceLoadingMap, setAttendanceLoadingMap] = useState<
    Record<string, boolean>
  >({});
  const [attendanceErrorMap, setAttendanceErrorMap] = useState<
    Record<string, Error | null>
  >({});
  const [duplicateSummaryMap, setDuplicateSummaryMap] = useState<
    Record<string, DuplicateAttendanceDaily[]>
  >({});

  useEffect(() => {
    const staffIds = Array.from(
      new Set((attendanceDailyList || []).map((r) => r.sub)),
    );
    if (staffIds.length === 0) {
      return;
    }

    let isMounted = true;

    staffIds.forEach((staffId) => {
      setAttendanceLoadingMap((state) => ({ ...state, [staffId]: true }));
      setAttendanceErrorMap((state) => ({ ...state, [staffId]: null }));

      const { startDate, endDate } =
        getAttendanceMonthRangeInput(displayDateFormatted);

      triggerListAttendancesByDateRange({ staffId, startDate, endDate })
        .unwrap()
        .then((attendances) => {
          if (!isMounted) return;
          setAttendanceMap((map) => ({ ...map, [staffId]: attendances }));
          setDuplicateSummaryMap((state) => ({
            ...state,
            [staffId]: [],
          }));
        })
        .catch((err) => {
          if (!isMounted) return;

          const errorInstance =
            err instanceof Error
              ? err
              : new Error("Failed to fetch attendances");
          setAttendanceErrorMap((state) => ({
            ...state,
            [staffId]: errorInstance,
          }));

          setDuplicateSummaryMap((state) => ({
            ...state,
            [staffId]: parseDuplicateListFromError(err, staffId, staffNameMap),
          }));
        })
        .finally(() => {
          if (!isMounted) return;
          setAttendanceLoadingMap((state) => ({
            ...state,
            [staffId]: false,
          }));
        });
    });

    return () => {
      isMounted = false;
    };
  }, [
    attendanceDailyList,
    displayDateFormatted,
    staffNameMap,
    triggerListAttendancesByDateRange,
  ]);

  const getAttendanceForDisplayDate = useCallback(
    (row: AttendanceDaily): Attendance | null => {
      const attendances = attendanceMap[row.sub] ?? [];
      if (displayDateFormatted) {
        const matched = attendances.find(
          (attendance) => attendance.workDate === displayDateFormatted,
        );
        if (matched) {
          return matched;
        }
      }
      if (!row.attendance) {
        return null;
      }
      if (
        displayDateFormatted &&
        row.attendance.workDate !== displayDateFormatted
      ) {
        return null;
      }
      return row.attendance;
    },
    [attendanceMap, displayDateFormatted],
  );

  const overtimeMinutesMap = useMemo(() => {
    return Object.entries(attendanceMap).reduce(
      (acc, [staffId, attendances]) => {
        acc[staffId] = calculateTotalOvertimeMinutes(
          attendances,
          scheduledHour,
          scheduledMinute,
        );
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [attendanceMap, scheduledHour, scheduledMinute]);

  const getOvertimeMinutes = useCallback(
    (row: AttendanceDaily): number => {
      const mapped = overtimeMinutesMap[row.sub];
      if (typeof mapped === "number") {
        return mapped;
      }
      const targetAttendance = getAttendanceForDisplayDate(row);
      if (!targetAttendance) return 0;
      return calculateTotalOvertimeMinutes(
        [targetAttendance],
        scheduledHour,
        scheduledMinute,
      );
    },
    [
      getAttendanceForDisplayDate,
      overtimeMinutesMap,
      scheduledHour,
      scheduledMinute,
    ],
  );

  const summaryDuplicateList = useMemo(
    () => Object.values(duplicateSummaryMap).flat(),
    [duplicateSummaryMap],
  );

  const mergedDuplicateAttendances = useMemo(() => {
    return mergeDuplicateAttendances(
      duplicateAttendances,
      summaryDuplicateList,
      loading,
    );
  }, [duplicateAttendances, loading, summaryDuplicateList]);

  const duplicateInfoByStaff = useMemo(() => {
    return buildDuplicateInfoByStaff(mergedDuplicateAttendances);
  }, [mergedDuplicateAttendances]);

  return {
    attendanceMap,
    attendanceLoadingMap,
    attendanceErrorMap,
    duplicateSummaryMap,
    getAttendanceForDisplayDate,
    overtimeMinutesMap,
    getOvertimeMinutes,
    summaryDuplicateList,
    mergedDuplicateAttendances,
    duplicateInfoByStaff,
  };
}
