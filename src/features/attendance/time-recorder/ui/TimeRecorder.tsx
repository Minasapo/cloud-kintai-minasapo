import {
  type AttendanceUpsertAction,
  useGetAttendanceByStaffAndDateQuery,
  useListRecentAttendancesQuery,
  useUpdateAttendanceMutation,
  useUpsertAttendanceByStaffAndDateMutation,
} from "@entities/attendance/api/attendanceApi";
import {
  useGetCompanyHolidayCalendarsQuery,
  useGetHolidayCalendarsQuery,
} from "@entities/calendar/api/calendarApi";
import fetchStaff from "@entities/staff/model/useStaff/fetchStaff";
import {
  Attendance,
  CreateAttendanceInput,
  OnUpdateAttendanceSubscription,
  Staff,
  UpdateAttendanceInput,
} from "@shared/api/graphql/types";
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
import { Link as RouterLink } from "react-router-dom";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AuthContext } from "@/context/AuthContext";
import {
  clockInAction,
  clockOutAction,
  GoDirectlyFlag,
  restEndAction,
  restStartAction,
  ReturnDirectlyFlag,
} from "@/entities/attendance/lib/actions/attendanceActions";
import { getWorkStatus } from "@/entities/attendance/lib/actions/workStatus";
import {
  AttendanceState,
  AttendanceStatus,
} from "@/entities/attendance/lib/AttendanceState";
import { resolveCurrentBusinessWorkDate } from "@/entities/attendance/lib/businessDate";
import { buildAttendanceIdempotencyKey } from "@/entities/attendance/lib/operationContext";
import {
  getNowISOStringWithZeroSeconds,
} from "@/entities/attendance/lib/time";
import * as MESSAGE_CODE from "@/errors";
import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import { onUpdateAttendance } from "@/shared/api/graphql/documents/subscriptions";
import { Logger } from "@/shared/lib/logger";
import { setSnackbarError } from "@/shared/lib/store/snackbarSlice";

import { WorkStatus, WorkStatusCodes } from "../lib/common";
import { clockInCallback } from "./clockInCallback";
import { clockOutCallback } from "./clockOutCallback";
import { goDirectlyCallback } from "./goDirectlyCallback";
import { restEndCallback } from "./restEndCallback";
import { restStartCallback } from "./restStartCallback";
import { returnDirectlyCallback } from "./returnDirectlyCallback";
import { TimeRecorderLoadingView, TimeRecorderView } from "./TimeRecorderView";

type TimeRecorderProps = {
  onAttendanceErrorCountChange?: (attendanceErrorCount: number) => void;
  onElapsedWorkTimeChange?: (payload: TimeRecorderElapsedWorkInfo) => void;
};

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

  return Math.max(dayjs(endTime ?? dayjs()).diff(dayjs(startTime), "minute"), 0);
}

/**
 * 勤怠打刻用のメインコンポーネント。
 * ユーザーの勤怠状態に応じて打刻・休憩・直行直帰などの操作UIを表示する。
 * @returns {JSX.Element} 勤怠打刻UI
 */
export default function TimeRecorder({
  onAttendanceErrorCountChange,
  onElapsedWorkTimeChange,
}: TimeRecorderProps): JSX.Element {
  const LOCAL_ATTENDANCE_UPDATE_IGNORE_MS = 3000;
  const VISIBILITY_REFRESH_THRESHOLD_MINUTES = 5;
  const { cognitoUser } = useContext(AuthContext);

  const dispatch = useDispatch();

  const { getStartTime, getEndTime } = useContext(AppConfigContext);

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

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const shouldFetchAttendance = Boolean(cognitoUser?.id);

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
  const calendarLoading =
    isHolidayCalendarsLoading ||
    isHolidayCalendarsFetching ||
    isCompanyHolidayCalendarsLoading ||
    isCompanyHolidayCalendarsFetching;

  const {
    data: attendanceData,
    isLoading: isAttendanceInitialLoading,
    isFetching: isAttendanceFetching,
    isUninitialized: isAttendanceUninitialized,
    error: attendanceError,
    refetch: refetchAttendance,
  } = useGetAttendanceByStaffAndDateQuery(
    { staffId: cognitoUser?.id ?? "", workDate: currentWorkDate },
    { skip: !shouldFetchAttendance },
  );

  const {
    data: attendancesData,
    isLoading: isAttendancesInitialLoading,
    isFetching: isAttendancesFetching,
    isUninitialized: isAttendancesUninitialized,
    error: attendancesError,
    refetch: refetchAttendances,
  } = useListRecentAttendancesQuery(
    { staffId: cognitoUser?.id ?? "" },
    { skip: !shouldFetchAttendance },
  );

  const attendance = attendanceData;
  const attendances: Attendance[] = attendancesData?.attendances ?? [];

  const attendanceLoading =
    !shouldFetchAttendance ||
    isAttendanceInitialLoading ||
    isAttendanceFetching ||
    isAttendanceUninitialized;

  const attendancesLoading =
    !shouldFetchAttendance ||
    isAttendancesInitialLoading ||
    isAttendancesFetching ||
    isAttendancesUninitialized;

  const [upsertAttendanceMutation] = useUpsertAttendanceByStaffAndDateMutation();
  const [updateAttendanceMutation] = useUpdateAttendanceMutation();
  const localAttendanceUpdateIgnoreUntilRef = useRef(0);

  const resolveUpsertAction = useCallback(
    (input: CreateAttendanceInput): AttendanceUpsertAction => {
      if (input.goDirectlyFlag) return "go_directly";
      if (input.returnDirectlyFlag) return "return_directly";
      if (input.startTime) return "clock_in";
      if (input.endTime) return "clock_out";
      const rests = input.rests ?? [];
      if (rests.some((rest) => Boolean(rest?.startTime) && !rest?.endTime)) {
        return "rest_start";
      }
      if (rests.some((rest) => Boolean(rest?.endTime))) {
        return "rest_end";
      }
      return "manual";
    },
    [],
  );

  const resolveOccurredAtFromCreateInput = useCallback(
    (input: CreateAttendanceInput) =>
      input.startTime ??
      input.endTime ??
      input.rests?.find((rest) => rest?.startTime)?.startTime ??
      input.rests?.find((rest) => rest?.endTime)?.endTime ??
      getNowISOStringWithZeroSeconds(),
    [],
  );

  const createAttendance = useCallback(
    (input: CreateAttendanceInput) => {
      const occurredAt = resolveOccurredAtFromCreateInput(input);
      const action = resolveUpsertAction(input);
      const idempotencyKey = buildAttendanceIdempotencyKey({
        action,
        staffId: input.staffId,
        occurredAt,
      });
      return upsertAttendanceMutation({
        input,
        action,
        occurredAt,
        idempotencyKey,
      }).unwrap();
    },
    [
      resolveOccurredAtFromCreateInput,
      resolveUpsertAction,
      upsertAttendanceMutation,
    ],
  );

  const updateAttendance = useCallback(
    (input: UpdateAttendanceInput) => {
      localAttendanceUpdateIgnoreUntilRef.current =
        Date.now() + LOCAL_ATTENDANCE_UPDATE_IGNORE_MS;
      return updateAttendanceMutation(input).unwrap();
    },
    [updateAttendanceMutation],
  );

  const refreshAttendanceData = useCallback(async () => {
    if (!shouldFetchAttendance) {
      return;
    }

    await Promise.allSettled([refetchAttendance(), refetchAttendances()]);
  }, [refetchAttendance, refetchAttendances, shouldFetchAttendance]);

  const clockIn = useCallback(
    async (
      staffId: string,
      workDate: string,
      startTime: string,
      goDirectlyFlag = GoDirectlyFlag.NO,
    ) => {
      const result = await clockInAction({
        attendance,
        staffId,
        workDate,
        startTime,
        goDirectlyFlag,
        createAttendance,
        updateAttendance,
      });

      await refreshAttendanceData();

      return result;
    },
    [attendance, createAttendance, updateAttendance, refreshAttendanceData],
  );

  const clockOut = useCallback(
    async (
      staffId: string,
      workDate: string,
      endTime: string,
      returnDirectlyFlag = ReturnDirectlyFlag.NO,
    ) => {
      const result = await clockOutAction({
        attendance,
        staffId,
        workDate,
        endTime,
        returnDirectlyFlag,
        createAttendance,
        updateAttendance,
      });

      await refreshAttendanceData();

      return result;
    },
    [attendance, createAttendance, updateAttendance, refreshAttendanceData],
  );

  const restStart = useCallback(
    async (staffId: string, workDate: string, startTime: string) => {
      const result = await restStartAction({
        attendance,
        staffId,
        workDate,
        time: startTime,
        createAttendance,
        updateAttendance,
      });

      await refreshAttendanceData();

      return result;
    },
    [attendance, createAttendance, updateAttendance, refreshAttendanceData],
  );

  const restEnd = useCallback(
    async (staffId: string, workDate: string, endTime: string) => {
      const result = await restEndAction({
        attendance,
        staffId,
        workDate,
        time: endTime,
        createAttendance,
        updateAttendance,
      });

      await refreshAttendanceData();

      return result;
    },
    [attendance, createAttendance, updateAttendance, refreshAttendanceData],
  );

  const [workStatus, setWorkStatus] = useState<WorkStatus | null | undefined>(
    undefined,
  );
  const [staff, setStaff] = useState<Staff | null | undefined>(undefined);
  const [attendanceErrorCount, setAttendanceErrorCount] = useState(0);
  const [isAttendanceError, setIsAttendanceError] = useState(false);
  const [isTimeElapsedError, setIsTimeElapsedError] = useState(false);
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

  // 変更リクエスト中かどうか
  const hasChangeRequest = useMemo(() => {
    if (!attendance?.changeRequests) return false;
    return attendance.changeRequests
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .some((item) => !item.completed);
  }, [attendance?.changeRequests]);

  const logger = new Logger("TimeRecorder", "DEBUG");

  const refreshStaff = useCallback(async () => {
    if (!cognitoUser?.id) {
      return;
    }

    try {
      const latestStaff = await fetchStaff(cognitoUser.id);
      setStaff(latestStaff);
    } catch {
      dispatch(setSnackbarError(MESSAGE_CODE.E00001));
    }
  }, [cognitoUser?.id, dispatch]);

  const refreshTimeRecorderData = useCallback(async () => {
    await Promise.allSettled([refreshStaff(), refreshAttendanceData()]);
  }, [refreshAttendanceData, refreshStaff]);

  useEffect(() => {
    if (holidayCalendarsError || companyHolidayCalendarsError) {
      logger.debug(holidayCalendarsError ?? companyHolidayCalendarsError);
      dispatch(setSnackbarError(MESSAGE_CODE.E00001));
    }
  }, [holidayCalendarsError, companyHolidayCalendarsError, dispatch, logger]);

  const clockInDisplayText = useMemo(() => {
    if (!attendance?.startTime) {
      return null;
    }
    return `${dayjs(attendance.startTime).format("HH:mm")} 出勤`;
  }, [attendance?.startTime]);

  const clockOutDisplayText = useMemo(() => {
    if (!attendance?.endTime) {
      return null;
    }
    return `${dayjs(attendance.endTime).format("HH:mm")} 退勤`;
  }, [attendance?.endTime]);

  const handleClockIn = useCallback(
    () => {
      const occurredAt = getNowISOStringWithZeroSeconds();
      return clockInCallback(
        cognitoUser,
        clockIn,
        dispatch,
        staff,
        logger,
        occurredAt,
      );
    },
    [clockIn, cognitoUser, dispatch, logger, staff],
  );

  const handleClockOut = useCallback(
    () => {
      const occurredAt = getNowISOStringWithZeroSeconds();
      return clockOutCallback(
        cognitoUser,
        clockOut,
        dispatch,
        staff,
        logger,
        undefined,
        occurredAt,
      );
    },
    [clockOut, cognitoUser, dispatch, logger, staff],
  );

  const handleGoDirectly = useCallback(() => {
    const occurredAt = getNowISOStringWithZeroSeconds();
    const baseDate = dayjs(occurredAt);
    const configured = getStartTime();
    const startIso = baseDate
      .hour(configured.hour())
      .minute(configured.minute())
      .second(0)
      .millisecond(0)
      .toISOString();

    return goDirectlyCallback(
      cognitoUser,
      staff,
      dispatch,
      clockIn,
      logger,
      startIso,
      occurredAt,
    );
  }, [
    cognitoUser,
    clockIn,
    dispatch,
    staff,
    logger,
    getStartTime,
  ]);

  const handleReturnDirectly = useCallback(() => {
    const occurredAt = getNowISOStringWithZeroSeconds();
    const baseDate = dayjs(occurredAt);
    const configured = getEndTime();
    const endIso = baseDate
      .hour(configured.hour())
      .minute(configured.minute())
      .second(0)
      .millisecond(0)
      .toISOString();

    return returnDirectlyCallback(
      cognitoUser,
      staff,
      dispatch,
      clockOut,
      logger,
      endIso,
      occurredAt,
    );
  }, [
    cognitoUser,
    staff,
    dispatch,
    clockOut,
    logger,
    getEndTime,
  ]);

  const handleRestStart = useCallback(
    () => {
      const occurredAt = getNowISOStringWithZeroSeconds();
      return restStartCallback(
        cognitoUser,
        dispatch,
        restStart,
        logger,
        occurredAt,
      );
    },
    [cognitoUser, dispatch, logger, restStart],
  );

  const handleRestEnd = useCallback(
    () => {
      const occurredAt = getNowISOStringWithZeroSeconds();
      return restEndCallback(
        cognitoUser,
        restEnd,
        dispatch,
        logger,
        occurredAt,
      );
    },
    [cognitoUser, dispatch, logger, restEnd],
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
    if (!shouldFetchAttendance || !attendanceError) {
      return;
    }

    dispatch(setSnackbarError(MESSAGE_CODE.E01001));
  }, [attendanceError, dispatch, shouldFetchAttendance]);

  useEffect(() => {
    if (!shouldFetchAttendance || !attendancesError) {
      return;
    }

    dispatch(setSnackbarError(MESSAGE_CODE.E02001));
  }, [attendancesError, dispatch, shouldFetchAttendance]);

  useEffect(() => {
    if (!staff || attendanceLoading || attendancesLoading || calendarLoading) {
      return;
    }

    const errorCount = attendances
      .map((attendance) => {
        const status = new AttendanceState(
          staff,
          attendance,
          holidayCalendars,
          companyHolidayCalendars,
        ).get();
        return status;
      })
      .filter((status) => status === AttendanceStatus.Error).length;

    setAttendanceErrorCount(errorCount);
    setIsAttendanceError(errorCount > 0);

    // 1週間以上前にエラーがあるかチェック
    const timeElapsedErrorCount = attendances.filter((attendance) => {
      const { workDate } = attendance;
      const isAfterOneWeek = dayjs().isAfter(dayjs(workDate).add(1, "week"));
      if (!isAfterOneWeek) return false;
      const status = new AttendanceState(
        staff,
        attendance,
        holidayCalendars,
        companyHolidayCalendars,
      ).get();
      return status === AttendanceStatus.Error;
    }).length;

    setIsTimeElapsedError(timeElapsedErrorCount > 0);
  }, [
    attendanceLoading,
    attendancesLoading,
    staff,
    holidayCalendars,
    companyHolidayCalendars,
    attendances,
    calendarLoading,
  ]);

  useEffect(() => {
    setWorkStatus(getWorkStatus(attendance));
  }, [attendance]);

  const elapsedWorkInfo = useMemo<TimeRecorderElapsedWorkInfo>(() => {
    void elapsedWorkTick;

    if (!attendance?.startTime || !workStatus) {
      return DEFAULT_ELAPSED_WORK_INFO;
    }

    if (
      workStatus.code !== WorkStatusCodes.WORKING &&
      workStatus.code !== WorkStatusCodes.RESTING
    ) {
      return DEFAULT_ELAPSED_WORK_INFO;
    }

    const grossWorkMinutes = calcElapsedMinutes(attendance.startTime);
    const totalRestMinutes = (attendance.rests ?? [])
      .filter((rest): rest is NonNullable<typeof rest> => rest !== null)
      .reduce((sum, rest) => {
        if (!rest.startTime) {
          return sum;
        }
        return sum + calcElapsedMinutes(rest.startTime, rest.endTime);
      }, 0);

    const netWorkMinutes = Math.max(grossWorkMinutes - totalRestMinutes, 0);
    const activeRest = (attendance.rests ?? [])
      .filter((rest): rest is NonNullable<typeof rest> => rest !== null)
      .reduce<NonNullable<Attendance["rests"]>[number] | null>((latest, rest) => {
        if (!rest.startTime || rest.endTime) {
          return latest;
        }
        if (!latest?.startTime) {
          return rest;
        }
        return dayjs(rest.startTime).isAfter(dayjs(latest.startTime))
          ? rest
          : latest;
      }, null);
    const activeRestMinutes =
      workStatus.code === WorkStatusCodes.RESTING && activeRest?.startTime
        ? calcElapsedMinutes(activeRest.startTime)
        : 0;

    return {
      visible: true,
      workDurationLabel: formatElapsedDurationFromMinutes(netWorkMinutes),
      restDurationLabel: formatElapsedDurationFromMinutes(activeRestMinutes),
    };
  }, [attendance, workStatus, elapsedWorkTick]);

  useEffect(() => {
    onAttendanceErrorCountChange?.(attendanceErrorCount);
  }, [attendanceErrorCount, onAttendanceErrorCountChange]);

  useEffect(() => {
    onElapsedWorkTimeChange?.(elapsedWorkInfo);
  }, [elapsedWorkInfo, onElapsedWorkTimeChange]);

  // 勤怠データ更新のサブスクリプション
  useEffect(() => {
    if (!cognitoUser?.id) {
      return;
    }

    const subscription = graphqlClient
      .graphql({
        query: onUpdateAttendance,
        variables: {
          filter: {
            staffId: { eq: cognitoUser.id },
            workDate: { eq: currentWorkDate },
          },
        },
        authMode: "userPool",
      })
      .subscribe({
        next: (event) => {
          const updatedAttendance = (
            event.data as OnUpdateAttendanceSubscription
          )?.onUpdateAttendance;
          if (!updatedAttendance) {
            return;
          }

          const shouldIgnoreLocalUpdate =
            Date.now() < localAttendanceUpdateIgnoreUntilRef.current;
          if (shouldIgnoreLocalUpdate) {
            return;
          }

          void refreshTimeRecorderData();
        },
        error: (error: unknown) => {
          logger.error("Subscription error:", error);
        },
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [cognitoUser?.id, currentWorkDate, logger, refreshTimeRecorderData]);

  if (attendanceLoading || calendarLoading || workStatus === undefined) {
    return <TimeRecorderLoadingView />;
  }

  if (workStatus === null) {
    dispatch(setSnackbarError(MESSAGE_CODE.E00001));
    return <></>;
  }

  return (
    <TimeRecorderView
      today={currentWorkDate}
      staffId={staff?.id ?? null}
      workStatus={workStatus}
      directMode={directMode}
      hasChangeRequest={hasChangeRequest}
      isAttendanceError={isAttendanceError}
      clockInDisplayText={clockInDisplayText}
      clockOutDisplayText={clockOutDisplayText}
      onDirectModeChange={setDirectMode}
      onClockIn={handleClockIn}
      onClockOut={handleClockOut}
      onGoDirectly={handleGoDirectly}
      onReturnDirectly={handleReturnDirectly}
      onRestStart={handleRestStart}
      onRestEnd={handleRestEnd}
      timeElapsedErrorDialog={
        <TimeElapsedErrorDialog isTimeElapsedError={isTimeElapsedError} />
      }
    />
  );
}

/**
 * 1週間以上経過した打刻エラーがある場合に表示するダイアログコンポーネント。
 * @param isTimeElapsedError - エラーが存在するかどうかのフラグ
 * @returns {JSX.Element} ダイアログUI
 */
function TimeElapsedErrorDialog({
  isTimeElapsedError,
}: {
  isTimeElapsedError: boolean;
}): JSX.Element {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(isTimeElapsedError);
  }, [isTimeElapsedError]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      aria-modal="true"
      role="dialog"
      data-testid="time-elapsed-error-dialog"
      className={`${open ? "flex" : "hidden"} fixed inset-0 z-50 items-center justify-center bg-slate-950/50 p-4`}
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2
          id="alert-dialog-title"
          className="m-0 text-lg font-semibold text-slate-900"
        >
          <span data-testid="time-elapsed-error-dialog-title-text">
            1週間以上経過した打刻エラーがあります
          </span>
        </h2>
        <div className="mt-4">
          <p
            id="alert-dialog-description"
            className="m-0 text-sm leading-6 text-slate-700"
          >
            <span data-testid="time-elapsed-error-dialog-description-text">
              1週間以上経過した打刻エラーがあります。
            </span>
            <br />
            勤怠一覧を確認して打刻修正を申請してください。
          </p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            data-testid="time-elapsed-error-dialog-later-btn"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            あとで
          </button>
          <RouterLink
            to="/attendance/list"
            onClick={handleClose}
            data-testid="time-elapsed-error-dialog-confirm-btn"
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white no-underline transition-colors hover:bg-emerald-700 hover:no-underline"
          >
            確認する
          </RouterLink>
        </div>
      </div>
    </div>
  );
}
