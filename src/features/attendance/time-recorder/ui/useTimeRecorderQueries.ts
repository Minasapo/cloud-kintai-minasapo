import {
  useGetAttendanceByStaffAndDateQuery,
  useListAttendancesByDateRangeWithPlaceholdersQuery,
} from "@entities/attendance/api/attendanceApi";
import {
  getEffectiveDateRange,
  getEffectivePastDateRangeEnd,
} from "@entities/attendance/lib/aggregationDateRange";
import useCloseDates from "@entities/attendance/model/useCloseDates";
import { useCalendars } from "@entities/calendar/model/useCalendars";
import { Attendance } from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { useMemo } from "react";

type UseTimeRecorderQueriesParams = {
  cognitoId: string | undefined;
  currentWorkDate: string;
};

export function useTimeRecorderQueries({
  cognitoId,
  currentWorkDate,
}: UseTimeRecorderQueriesParams) {
  const shouldFetchAttendance = Boolean(cognitoId);
  const {
    holidayCalendars,
    companyHolidayCalendars,
    isLoading: calendarLoading,
    error: calendarsError,
  } = useCalendars();
  const { closeDates, loading: closeDatesLoading } = useCloseDates();
  const attendanceErrorToday = useMemo(
    () => dayjs(currentWorkDate).startOf("day"),
    [currentWorkDate],
  );
  const attendanceErrorCurrentMonth = useMemo(
    () => attendanceErrorToday.startOf("month"),
    [attendanceErrorToday],
  );
  const attendanceErrorEffectiveDateRange = useMemo(
    () => getEffectiveDateRange(attendanceErrorCurrentMonth, closeDates),
    [attendanceErrorCurrentMonth, closeDates],
  );
  const attendanceErrorQueryEnd = useMemo(
    () =>
      getEffectivePastDateRangeEnd(
        attendanceErrorEffectiveDateRange,
        attendanceErrorToday,
      ),
    [attendanceErrorEffectiveDateRange, attendanceErrorToday],
  );
  const shouldFetchAttendanceErrors =
    shouldFetchAttendance &&
    !attendanceErrorEffectiveDateRange.start.isAfter(
      attendanceErrorQueryEnd,
      "day",
    );
  const {
    data: attendanceData,
    isLoading: isAttendanceInitialLoading,
    isUninitialized: isAttendanceUninitialized,
    error: attendanceError,
    refetch: refetchAttendance,
  } = useGetAttendanceByStaffAndDateQuery(
    { staffId: cognitoId ?? "", workDate: currentWorkDate },
    { skip: !shouldFetchAttendance },
  );
  const {
    data: attendancesData,
    isLoading: isAttendancesInitialLoading,
    isUninitialized: isAttendancesUninitialized,
    error: attendancesError,
    refetch: refetchAttendances,
  } = useListAttendancesByDateRangeWithPlaceholdersQuery(
    {
      staffId: cognitoId ?? "",
      startDate: attendanceErrorEffectiveDateRange.start.format("YYYY-MM-DD"),
      endDate: attendanceErrorQueryEnd.format("YYYY-MM-DD"),
    },
    { skip: !shouldFetchAttendanceErrors },
  );
  const attendance = attendanceData ?? undefined;
  const attendances: Attendance[] = attendancesData?.attendances ?? [];
  const attendanceLoading =
    !shouldFetchAttendance ||
    isAttendanceInitialLoading ||
    isAttendanceUninitialized;
  const attendancesLoading =
    closeDatesLoading ||
    (shouldFetchAttendanceErrors &&
      (isAttendancesInitialLoading || isAttendancesUninitialized));
  return {
    shouldFetchAttendance,
    shouldFetchAttendanceErrors,
    attendance,
    attendances,
    attendanceLoading,
    attendancesLoading,
    attendanceError,
    attendancesError,
    refetchAttendance,
    refetchAttendances,
    holidayCalendars,
    companyHolidayCalendars,
    calendarLoading,
    calendarsError,
    attendanceErrorToday,
  };
}
