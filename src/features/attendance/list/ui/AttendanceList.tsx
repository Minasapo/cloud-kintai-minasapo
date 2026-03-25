import "./AttendanceList.scss";

import { useListAttendancesByDateRangeQuery } from "@entities/attendance/api/attendanceApi";
import useCloseDates from "@entities/attendance/model/useCloseDates";
import {
  useGetCompanyHolidayCalendarsQuery,
  useGetHolidayCalendarsQuery,
} from "@entities/calendar/api/calendarApi";
import fetchStaff from "@entities/staff/model/useStaff/fetchStaff";
import { LinearProgress, useMediaQuery, useTheme } from "@mui/material";
import {
  OnCreateAttendanceSubscription,
  OnDeleteAttendanceSubscription,
  OnUpdateAttendanceSubscription,
  Staff,
} from "@shared/api/graphql/types";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";
import * as MESSAGE_CODE from "@/errors";
import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import {
  onCreateAttendance,
  onDeleteAttendance,
  onUpdateAttendance,
} from "@/shared/api/graphql/documents/subscriptions";
import { Logger } from "@/shared/lib/logger";
import { setSnackbarError } from "@/shared/lib/store/snackbarSlice";

import AttendanceListCard from "./AttendanceListCard";
import AttendanceListHeader from "./AttendanceListHeader";
import {
  formatDateRangeLabel,
  getAttendanceQueryDateRange,
  getCurrentMonthFromQuery,
  getEffectiveDateRange,
  MONTH_QUERY_KEY,
  shouldRefetchForAttendanceEvent,
} from "./attendanceListUtils";
import DesktopList from "./DesktopList";
import MobileList from "./MobileList/MobileList";

export default function AttendanceTable() {
  const { cognitoUser } = useContext(AuthContext);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const shouldFetchAttendances = Boolean(cognitoUser?.id);
  const currentMonth = useMemo(
    () => getCurrentMonthFromQuery(searchParams.get(MONTH_QUERY_KEY)),
    [searchParams],
  );

  const handleMonthChange = useCallback(
    (nextMonth: Dayjs) => {
      const normalizedMonth = nextMonth.startOf("month");
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set(MONTH_QUERY_KEY, normalizedMonth.format("YYYY-MM"));
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const {
    data: holidayCalendars = [],
    isLoading: isHolidayCalendarsLoading,
    isFetching: isHolidayCalendarsFetching,
    error: holidayCalendarsError,
  } = useGetHolidayCalendarsQuery();
  const {
    data: companyHolidayCalendars = [],
    isLoading: isCompanyHolidayCalendarsLoading,
    isFetching: isCompanyHolidayCalendarsFetching,
    error: companyHolidayCalendarsError,
  } = useGetCompanyHolidayCalendarsQuery();
  const {
    closeDates,
    loading: closeDatesLoading,
    error: closeDatesError,
  } = useCloseDates();
  const calendarLoading =
    isHolidayCalendarsLoading ||
    isHolidayCalendarsFetching ||
    isCompanyHolidayCalendarsLoading ||
    isCompanyHolidayCalendarsFetching;

  const effectiveDateRange = useMemo(
    () => getEffectiveDateRange(currentMonth, closeDates),
    [currentMonth, closeDates],
  );

  const attendanceQueryDateRange = useMemo(
    () => getAttendanceQueryDateRange(currentMonth, effectiveDateRange),
    [currentMonth, effectiveDateRange],
  );

  const startDate = attendanceQueryDateRange.start.format(
    AttendanceDate.DataFormat,
  );
  const endDate = attendanceQueryDateRange.end.format(
    AttendanceDate.DataFormat,
  );

  const {
    data: attendances = [],
    isLoading: isAttendancesInitialLoading,
    isFetching: isAttendancesFetching,
    isUninitialized: isAttendancesUninitialized,
    error: attendancesError,
    refetch: refetchAttendances,
  } = useListAttendancesByDateRangeQuery(
    {
      staffId: cognitoUser?.id ?? "",
      startDate,
      endDate,
    },
    {
      skip: !shouldFetchAttendances,
      refetchOnMountOrArgChange: true,
    },
  );

  const attendanceLoading =
    !shouldFetchAttendances ||
    isAttendancesInitialLoading ||
    isAttendancesFetching ||
    isAttendancesUninitialized;

  useEffect(() => {
    const currentStaffId = cognitoUser?.id;
    if (!currentStaffId || !shouldFetchAttendances) return;

    let refetchTimer: ReturnType<typeof setTimeout> | null = null;

    const queryRange = { start: dayjs(startDate), end: dayjs(endDate) };

    const scheduleRefetch = () => {
      if (refetchTimer) {
        clearTimeout(refetchTimer);
      }

      refetchTimer = setTimeout(() => {
        void refetchAttendances();
      }, 300);
    };

    const createSubscription = graphqlClient
      .graphql({ query: onCreateAttendance, authMode: "userPool" })
      .subscribe({
        next: ({ data }: { data?: OnCreateAttendanceSubscription }) => {
          const attendance = data?.onCreateAttendance;
          if (
            !shouldRefetchForAttendanceEvent(
              currentStaffId,
              queryRange,
              attendance?.staffId,
              attendance?.workDate,
            )
          ) {
            return;
          }
          scheduleRefetch();
        },
      });

    const updateSubscription = graphqlClient
      .graphql({ query: onUpdateAttendance, authMode: "userPool" })
      .subscribe({
        next: ({ data }: { data?: OnUpdateAttendanceSubscription }) => {
          const attendance = data?.onUpdateAttendance;
          if (
            !shouldRefetchForAttendanceEvent(
              currentStaffId,
              queryRange,
              attendance?.staffId,
              attendance?.workDate,
            )
          ) {
            return;
          }
          scheduleRefetch();
        },
      });

    const deleteSubscription = graphqlClient
      .graphql({ query: onDeleteAttendance, authMode: "userPool" })
      .subscribe({
        next: ({ data }: { data?: OnDeleteAttendanceSubscription }) => {
          const attendance = data?.onDeleteAttendance;
          if (
            !shouldRefetchForAttendanceEvent(
              currentStaffId,
              queryRange,
              attendance?.staffId,
              attendance?.workDate,
            )
          ) {
            return;
          }
          scheduleRefetch();
        },
      });

    return () => {
      createSubscription.unsubscribe();
      updateSubscription.unsubscribe();
      deleteSubscription.unsubscribe();
      if (refetchTimer) {
        clearTimeout(refetchTimer);
      }
    };
  }, [
    cognitoUser?.id,
    shouldFetchAttendances,
    startDate,
    endDate,
    refetchAttendances,
  ]);

  const logger = useMemo(
    () => new Logger("AttendanceList", import.meta.env.DEV ? "DEBUG" : "ERROR"),
    [],
  );
  const [staff, setStaff] = useState<Staff | null | undefined>(undefined);

  useEffect(() => {
    if (!cognitoUser) return;
    fetchStaff(cognitoUser.id)
      .then((res: Staff | undefined) => {
        setStaff(res);
      })
      .catch((error: unknown) => {
        logger.debug(error);
        dispatch(setSnackbarError(MESSAGE_CODE.E00001));
      });
  }, [cognitoUser, dispatch, logger]);

  useEffect(() => {
    if (holidayCalendarsError || companyHolidayCalendarsError) {
      logger.debug(holidayCalendarsError ?? companyHolidayCalendarsError);
      dispatch(setSnackbarError(MESSAGE_CODE.E00001));
    }
  }, [holidayCalendarsError, companyHolidayCalendarsError, dispatch, logger]);

  useEffect(() => {
    if (closeDatesError) {
      logger.debug(closeDatesError);
      dispatch(setSnackbarError(MESSAGE_CODE.E00001));
    }
  }, [closeDatesError, dispatch, logger]);

  useEffect(() => {
    if (attendancesError) {
      logger.debug(attendancesError);
      dispatch(setSnackbarError(MESSAGE_CODE.E02001));
    }
  }, [attendancesError, dispatch, logger]);

  const rangeLabelForDisplay = useMemo(
    () => formatDateRangeLabel(effectiveDateRange),
    [effectiveDateRange],
  );

  if (attendanceLoading || calendarLoading || closeDatesLoading) {
    return <LinearProgress />;
  }

  return (
    <div className="attendance-list">
      <AttendanceListHeader rangeLabelForDisplay={rangeLabelForDisplay} />

      <AttendanceListCard>
        {isDesktop ? (
          <DesktopList
            attendances={attendances}
            holidayCalendars={holidayCalendars}
            companyHolidayCalendars={companyHolidayCalendars}
            navigate={navigate}
            staff={staff}
            closeDates={closeDates}
            closeDatesLoading={closeDatesLoading}
            closeDatesError={closeDatesError}
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
          />
        ) : (
          <MobileList
            attendances={attendances}
            holidayCalendars={holidayCalendars}
            companyHolidayCalendars={companyHolidayCalendars}
            staff={staff}
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
            closeDates={closeDates}
          />
        )}
      </AttendanceListCard>
    </div>
  );
}
