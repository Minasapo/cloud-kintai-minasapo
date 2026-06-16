import { AuthContext } from "@app/providers/auth/AuthContext";
import { AppConfigContext } from "@entities/app-config/model/AppConfigContext";
import { getWorkStatus } from "@entities/attendance/lib/actions/workStatus";
import { Logger } from "@shared/lib/logger";
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

import { WorkStatus } from "../lib/common";
import {
  type TimeRecorderContextValue,
  TimeRecorderProvider,
} from "./TimeRecorderContext";
import {
  formatClockDisplayText,
  hasPendingChangeRequests,
  resolveElapsedWorkInfo,
  type TimeRecorderElapsedWorkInfo,
} from "./timeRecorderUtils";
import { TimeRecorderLoadingView, TimeRecorderView } from "./TimeRecorderView";
import { useAttendanceActions } from "./useAttendanceActions";
import { useAttendanceErrorStats } from "./useAttendanceErrorStats";
import { useStaffRefresh } from "./useStaffRefresh";
import { useTimeRecorderErrors } from "./useTimeRecorderErrors";
import { useTimeRecorderQueries } from "./useTimeRecorderQueries";
import { useTimeRecorderSubscription } from "./useTimeRecorderSubscription";
import { useWorkDateInterval } from "./useWorkDateInterval";

type TimeRecorderProps = {
  onAttendanceErrorCountChange?: (attendanceErrorCount: number) => void;
  onElapsedWorkTimeChange?: (payload: TimeRecorderElapsedWorkInfo) => void;
};
export type { TimeRecorderElapsedWorkInfo } from "./timeRecorderUtils";

function useTimeRecorderState({
  onAttendanceErrorCountChange,
  onElapsedWorkTimeChange,
}: TimeRecorderProps) {
  const VISIBILITY_REFRESH_THRESHOLD_MINUTES = 5;
  const { cognitoUser } = useContext(AuthContext);
  const dispatch = useDispatch();
  const { getLunchRestStartTime, getLunchRestEndTime } =
    useContext(AppConfigContext);
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
  const [workStatus, setWorkStatus] = useState<WorkStatus | undefined>(
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
  const { staff, refreshStaff } = useStaffRefresh({
    cognitoId: cognitoUser?.id,
    dispatch,
  });
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
  useTimeRecorderErrors({
    attendanceError,
    attendancesError,
    calendarsError,
    shouldFetchAttendance,
    dispatch,
    logger,
  });
  const { attendanceErrorCount, isAttendanceError, isTimeElapsedError } =
    useAttendanceErrorStats({
      staff,
      attendances,
      holidayCalendars,
      companyHolidayCalendars,
      attendanceLoading,
      attendancesLoading,
      calendarLoading,
      attendanceErrorToday,
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
  useTimeRecorderSubscription({
    cognitoId: cognitoUser?.id,
    currentWorkDate,
    localAttendanceUpdateIgnoreUntilRef,
    refreshTimeRecorderData,
    logger,
  });
  const contextValue = useMemo<TimeRecorderContextValue | null>(() => {
    if (workStatus === undefined) {
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
  const isLoading =
    attendanceLoading || calendarLoading || workStatus === undefined;

  return {
    isLoading,
    contextValue,
  };
}

export default function TimeRecorder({
  onAttendanceErrorCountChange,
  onElapsedWorkTimeChange,
}: TimeRecorderProps): JSX.Element {
  const { isLoading, contextValue } = useTimeRecorderState({
    onAttendanceErrorCountChange,
    onElapsedWorkTimeChange,
  });

  if (isLoading || !contextValue) {
    return <TimeRecorderLoadingView />;
  }

  return (
    <TimeRecorderProvider value={contextValue}>
      <TimeRecorderView />
    </TimeRecorderProvider>
  );
}
