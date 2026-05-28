import { AuthContext } from "@app/providers/auth/AuthContext";
import { AppConfigContext } from "@entities/app-config/model/AppConfigContext";
import { getWorkStatus } from "@entities/attendance/lib/actions/workStatus";
import { resolveCurrentBusinessWorkDate } from "@entities/attendance/lib/businessDate";
import fetchStaff from "@entities/staff/model/useStaff/fetchStaff";
import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import { onUpdateAttendance } from "@shared/api/graphql/documents/subscriptions";
import {
  Attendance,
  CompanyHolidayCalendar,
  HolidayCalendar,
  OnUpdateAttendanceSubscription,
  Staff,
} from "@shared/api/graphql/types";
import { Logger } from "@shared/lib/logger";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import dayjs from "dayjs";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";

import * as MESSAGE_CODE from "@/errors";

import { WorkStatus } from "../lib/common";
import {
  type TimeRecorderContextValue,
  TimeRecorderProvider,
} from "./TimeRecorderContext";
import {
  formatClockDisplayText,
  hasPendingChangeRequests,
  resolveElapsedWorkInfo,
  summarizeAttendanceErrors,
  type TimeRecorderElapsedWorkInfo,
} from "./timeRecorderUtils";
import { TimeRecorderLoadingView, TimeRecorderView } from "./TimeRecorderView";
import { useAttendanceActions } from "./useAttendanceActions";
import { useTimeRecorderQueries } from "./useTimeRecorderQueries";

function useWorkDateInterval(): string {
  const [currentWorkDate, setCurrentWorkDate] = useState(() =>
    resolveCurrentBusinessWorkDate(),
  );
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const nextWorkDate = resolveCurrentBusinessWorkDate();
      setCurrentWorkDate((prev) =>
        prev === nextWorkDate ? prev : nextWorkDate,
      );
    }, 30 * 1000);
    return () => { window.clearInterval(intervalId); };
  }, []);
  return currentWorkDate;
}

type UseStaffRefreshParams = { cognitoId: string | undefined; dispatch: ReturnType<typeof useDispatch> };
function useStaffRefresh({ cognitoId, dispatch }: UseStaffRefreshParams) {
  const [staff, setStaff] = useState<Staff | null | undefined>(undefined);
  const refreshStaff = useCallback(async () => {
    if (!cognitoId) return;
    try {
      const latestStaff = await fetchStaff(cognitoId);
      setStaff(latestStaff);
    } catch {
      dispatch(pushNotification({ tone: "error", message: MESSAGE_CODE.E00001 }));
    }
  }, [cognitoId, dispatch]);
  return { staff, refreshStaff };
}

type UseAttendanceErrorStatsParams = {
  staff: Staff | null | undefined;
  attendances: Attendance[];
  holidayCalendars: HolidayCalendar[];
  companyHolidayCalendars: CompanyHolidayCalendar[];
  attendanceLoading: boolean;
  attendancesLoading: boolean;
  calendarLoading: boolean;
  attendanceErrorToday: dayjs.Dayjs;
};
function useAttendanceErrorStats({ staff, attendances, holidayCalendars, companyHolidayCalendars, attendanceLoading, attendancesLoading, calendarLoading, attendanceErrorToday }: UseAttendanceErrorStatsParams) {
  const { errorCount, hasTimeElapsedError } = useMemo(() => {
    if (!staff || attendanceLoading || attendancesLoading || calendarLoading) {
      return { errorCount: 0, hasTimeElapsedError: false };
    }
    return summarizeAttendanceErrors({ staff, attendances, holidayCalendars, companyHolidayCalendars, today: attendanceErrorToday });
  }, [staff, attendances, holidayCalendars, companyHolidayCalendars, attendanceLoading, attendancesLoading, calendarLoading, attendanceErrorToday]);
  return { attendanceErrorCount: errorCount, isAttendanceError: errorCount > 0, isTimeElapsedError: hasTimeElapsedError };
}

type UseTimeRecorderErrorsParams = {
  attendanceError: unknown;
  attendancesError: unknown;
  calendarsError: unknown;
  shouldFetchAttendance: boolean;
  dispatch: ReturnType<typeof useDispatch>;
  logger: Logger;
};
function useTimeRecorderErrors({ attendanceError, attendancesError, calendarsError, shouldFetchAttendance, dispatch, logger }: UseTimeRecorderErrorsParams) {
  useEffect(() => {
    if (!calendarsError) return;
    logger.debug(calendarsError);
    dispatch(pushNotification({ tone: "error", message: MESSAGE_CODE.E00001 }));
  }, [calendarsError, dispatch, logger]);
  useEffect(() => {
    if (!shouldFetchAttendance || !attendanceError) return;
    dispatch(pushNotification({ tone: "error", message: MESSAGE_CODE.E01001 }));
  }, [attendanceError, dispatch, shouldFetchAttendance]);
  useEffect(() => {
    if (!shouldFetchAttendance || !attendancesError) return;
    dispatch(pushNotification({ tone: "error", message: MESSAGE_CODE.E02001 }));
  }, [attendancesError, dispatch, shouldFetchAttendance]);
}

type UseTimeRecorderSubscriptionParams = {
  cognitoId: string | undefined;
  currentWorkDate: string;
  localAttendanceUpdateIgnoreUntilRef: React.MutableRefObject<number>;
  refreshTimeRecorderData: () => Promise<void>;
  logger: Logger;
};
function useTimeRecorderSubscription({ cognitoId, currentWorkDate, localAttendanceUpdateIgnoreUntilRef, refreshTimeRecorderData, logger }: UseTimeRecorderSubscriptionParams) {
  useEffect(() => {
    if (!cognitoId) return;
    const subscription = graphqlClient.graphql({
      query: onUpdateAttendance,
      variables: { filter: { staffId: { eq: cognitoId }, workDate: { eq: currentWorkDate } } },
      authMode: "userPool",
    }).subscribe({
      next: (event) => {
        const updatedAttendance = (event.data as OnUpdateAttendanceSubscription)?.onUpdateAttendance;
        if (!updatedAttendance) return;
        if (Date.now() < localAttendanceUpdateIgnoreUntilRef.current) return;
        void refreshTimeRecorderData();
      },
      error: (error: unknown) => { logger.error("Subscription error:", error); },
    });
    return () => { subscription.unsubscribe(); };
  }, [cognitoId, currentWorkDate, logger, refreshTimeRecorderData]);
}

type TimeRecorderProps = {
  onAttendanceErrorCountChange?: (attendanceErrorCount: number) => void;
  onElapsedWorkTimeChange?: (payload: TimeRecorderElapsedWorkInfo) => void;
};
export type { TimeRecorderElapsedWorkInfo } from "./timeRecorderUtils";
export default function TimeRecorder({
  onAttendanceErrorCountChange,
  onElapsedWorkTimeChange,
}: TimeRecorderProps): JSX.Element {
  const VISIBILITY_REFRESH_THRESHOLD_MINUTES = 5;
  const { cognitoUser } = useContext(AuthContext);
  const dispatch = useDispatch();
  const {
    getLunchRestStartTime,
    getLunchRestEndTime,
  } = useContext(AppConfigContext);
  const currentWorkDate = useWorkDateInterval();
  const {
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
  } = useTimeRecorderQueries({ cognitoId: cognitoUser?.id, currentWorkDate });
  const [workStatus, setWorkStatus] = useState<WorkStatus | null | undefined>(
    undefined,
  );
  const [directMode, setDirectMode] = useState(false);
  const [elapsedWorkTick, setElapsedWorkTick] = useState(() => Date.now());
  const lastActiveTimeRef = useRef(dayjs());
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setElapsedWorkTick(Date.now());
    }, 30 * 1000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, []);
  const hasChangeRequest = useMemo(
    () => hasPendingChangeRequests(attendance),
    [attendance],
  );
  const logger = useMemo(
    () => new Logger("TimeRecorder", import.meta.env.DEV ? "DEBUG" : "ERROR"),
    [],
  );
  const { staff, refreshStaff } = useStaffRefresh({ cognitoId: cognitoUser?.id, dispatch });
  const {
    localAttendanceUpdateIgnoreUntilRef,
    refreshAttendanceData,
    handleClockIn,
    handleClockOut,
    handleGoDirectly,
    handleReturnDirectly,
    handleRestStart,
    handleRestEnd,
  } = useAttendanceActions({
    attendance,
    staff,
    logger,
    shouldFetchAttendance,
    shouldFetchAttendanceErrors,
    refetchAttendance,
    refetchAttendances,
  });
  const refreshTimeRecorderData = useCallback(async () => {
    await Promise.allSettled([refreshStaff(), refreshAttendanceData()]);
  }, [refreshAttendanceData, refreshStaff]);
  useTimeRecorderErrors({ attendanceError, attendancesError, calendarsError, shouldFetchAttendance, dispatch, logger });
  const { attendanceErrorCount, isAttendanceError, isTimeElapsedError } = useAttendanceErrorStats({
    staff, attendances, holidayCalendars, companyHolidayCalendars, attendanceLoading, attendancesLoading, calendarLoading, attendanceErrorToday,
  });
  const clockInDisplayText = useMemo(
    () => formatClockDisplayText(attendance?.startTime, "出勤"),
    [attendance?.startTime],
  );
  const clockOutDisplayText = useMemo(
    () => formatClockDisplayText(attendance?.endTime, "退勤"),
    [attendance?.endTime],
  );
  const handleVisibilityChange = useCallback(() => {
    const now = dayjs();
    if (document.visibilityState !== "visible") {
      return;
    }
    if (
      now.diff(lastActiveTimeRef.current, "minute") >
      VISIBILITY_REFRESH_THRESHOLD_MINUTES
    ) {
      void refreshTimeRecorderData();
    }
    lastActiveTimeRef.current = now;
  }, [refreshTimeRecorderData]);
  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleVisibilityChange]);
  useEffect(() => {
    void refreshStaff();
  }, [refreshStaff]);
  useEffect(() => {
    setWorkStatus(getWorkStatus(attendance));
  }, [attendance]);
  const elapsedWorkInfo = useMemo<TimeRecorderElapsedWorkInfo>(() => {
    void elapsedWorkTick;
    return resolveElapsedWorkInfo({
      attendance,
      workStatus,
      now: dayjs(),
      lunchRestStartTime: getLunchRestStartTime(),
      lunchRestEndTime: getLunchRestEndTime(),
    });
  }, [
    attendance,
    getLunchRestEndTime,
    getLunchRestStartTime,
    workStatus,
    elapsedWorkTick,
  ]);
  useEffect(() => {
    onAttendanceErrorCountChange?.(attendanceErrorCount);
  }, [attendanceErrorCount, onAttendanceErrorCountChange]);
  useEffect(() => {
    onElapsedWorkTimeChange?.(elapsedWorkInfo);
  }, [elapsedWorkInfo, onElapsedWorkTimeChange]);
  useTimeRecorderSubscription({ cognitoId: cognitoUser?.id, currentWorkDate, localAttendanceUpdateIgnoreUntilRef, refreshTimeRecorderData, logger });
  const contextValue = useMemo<TimeRecorderContextValue | null>(() => {
    if (workStatus === undefined || workStatus === null) {
      return null;
    }
    return {
      today: currentWorkDate,
      staffId: staff?.id ?? null,
      workStatus,
      directMode,
      hasChangeRequest,
      isAttendanceError,
      clockInDisplayText,
      clockOutDisplayText,
      onDirectModeChange: setDirectMode,
      onClockIn: handleClockIn,
      onClockOut: handleClockOut,
      onGoDirectly: handleGoDirectly,
      onReturnDirectly: handleReturnDirectly,
      onRestStart: handleRestStart,
      onRestEnd: handleRestEnd,
      isTimeElapsedError,
    };
  }, [
    currentWorkDate,
    staff?.id,
    workStatus,
    directMode,
    hasChangeRequest,
    isAttendanceError,
    clockInDisplayText,
    clockOutDisplayText,
    handleClockIn,
    handleClockOut,
    handleGoDirectly,
    handleReturnDirectly,
    handleRestStart,
    handleRestEnd,
    isTimeElapsedError,
  ]);
  if (attendanceLoading || calendarLoading || workStatus === undefined) {
    return <TimeRecorderLoadingView />;
  }
  if (workStatus === null) {
    dispatch(
      pushNotification({
        tone: "error",
        message: MESSAGE_CODE.E00001,
      }),
    );
    return <></>;
  }
  return (
    <TimeRecorderProvider value={contextValue!}>
      <TimeRecorderView />
    </TimeRecorderProvider>
  );
}
