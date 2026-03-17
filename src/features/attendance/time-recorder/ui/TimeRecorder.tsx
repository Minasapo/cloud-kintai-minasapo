import {
  useCreateAttendanceMutation,
  useGetAttendanceByStaffAndDateQuery,
  useListRecentAttendancesQuery,
  useUpdateAttendanceMutation,
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
import type { CSSProperties } from "react";
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
import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";
import {
  AttendanceState,
  AttendanceStatus,
} from "@/entities/attendance/lib/AttendanceState";
import * as MESSAGE_CODE from "@/errors";
import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import { onUpdateAttendance } from "@/shared/api/graphql/documents/subscriptions";
import { designTokenVar } from "@/shared/designSystem";
import { Logger } from "@/shared/lib/logger";
import { setSnackbarError } from "@/shared/lib/store/snackbarSlice";
import Clock from "@/shared/ui/clock/Clock";
import AttendanceErrorAlert from "@/shared/ui/time-recorder/AttendanceErrorAlert";
import DirectSwitch from "@/shared/ui/time-recorder/DirectSwitch";

import { WorkStatus } from "../lib/common";
import { clockInCallback } from "./clockInCallback";
import { clockOutCallback } from "./clockOutCallback";
import { goDirectlyCallback } from "./goDirectlyCallback";
import ClockInItem from "./items/ClockInItem";
import ClockOutItem from "./items/ClockOutItem";
import GoDirectlyItem from "./items/GoDirectlyItem";
import RestEndItem from "./items/RestEndItem";
import RestStartItem from "./items/RestStartItem";
import ReturnDirectly from "./items/ReturnDirectlyItem";
import QuickDailyReportCard from "./QuickDailyReportCard";
import { restEndCallback } from "./restEndCallback";
import { restStartCallback } from "./restStartCallback";
import { RestTimeMessage } from "./RestTimeMessage";
import { returnDirectlyCallback } from "./returnDirectlyCallback";

/**
 * 勤怠打刻用のメインコンポーネント。
 * ユーザーの勤怠状態に応じて打刻・休憩・直行直帰などの操作UIを表示する。
 * @returns {JSX.Element} 勤怠打刻UI
 */
export default function TimeRecorder(): JSX.Element {
  const LOCAL_ATTENDANCE_UPDATE_IGNORE_MS = 3000;
  const VISIBILITY_REFRESH_THRESHOLD_MINUTES = 5;
  const { cognitoUser } = useContext(AuthContext);

  const dispatch = useDispatch();

  const { getStartTime, getEndTime } = useContext(AppConfigContext);

  const today = useMemo(() => dayjs().format(AttendanceDate.DataFormat), []);

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
    { staffId: cognitoUser?.id ?? "", workDate: today },
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

  const [createAttendanceMutation] = useCreateAttendanceMutation();
  const [updateAttendanceMutation] = useUpdateAttendanceMutation();
  const localAttendanceUpdateIgnoreUntilRef = useRef(0);

  const createAttendance = useCallback(
    (input: CreateAttendanceInput) => createAttendanceMutation(input).unwrap(),
    [createAttendanceMutation],
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
  const [isAttendanceError, setIsAttendanceError] = useState(false);
  const [isTimeElapsedError, setIsTimeElapsedError] = useState(false);
  const [directMode, setDirectMode] = useState(false);
  const lastActiveTimeRef = useRef(dayjs());

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

  const TIME_RECORDER_WIDTH_MD = designTokenVar(
    "component.timeRecorder.layout.widthMd",
    "400px",
  );
  const TIME_RECORDER_MARGIN_XS = designTokenVar(
    "component.timeRecorder.layout.marginXMobile",
    "24px",
  );
  const TIME_RECORDER_SURFACE_BG = designTokenVar(
    "component.timeRecorder.surface.background",
    "#FFFFFF",
  );
  const TIME_RECORDER_BORDER_COLOR = designTokenVar(
    "component.timeRecorder.surface.borderColor",
    "#E5E7EB",
  );
  const TIME_RECORDER_BORDER_WIDTH = designTokenVar(
    "component.timeRecorder.surface.borderWidth",
    "1px",
  );
  const TIME_RECORDER_BORDER_RADIUS = designTokenVar(
    "component.timeRecorder.surface.borderRadius",
    "12px",
  );
  const TIME_RECORDER_SURFACE_SHADOW = designTokenVar(
    "component.timeRecorder.surface.shadow",
    "0 12px 24px rgba(17, 24, 39, 0.08)",
  );
  const TIME_RECORDER_PADDING_XS = designTokenVar(
    "component.timeRecorder.surface.padding.xs",
    "16px",
  );
  const TIME_RECORDER_PADDING_MD = designTokenVar(
    "component.timeRecorder.surface.padding.md",
    "24px",
  );

  const BADGE_PADDING_X = designTokenVar("spacing.sm", "8px");
  const BADGE_PADDING_Y = designTokenVar("spacing.xs", "4px");
  const BADGE_RADIUS = designTokenVar("radius.sm", "4px");
  const BADGE_FONT_WEIGHT = designTokenVar("typography.fontWeight.bold", "600");
  const CLOCK_IN_BADGE_BG = designTokenVar(
    "color.feedback.success.surface",
    "#E4F8C9",
  );
  const CLOCK_IN_BADGE_TEXT = designTokenVar(
    "color.feedback.success.base",
    "#1EAA6A",
  );
  const CLOCK_OUT_BADGE_BG = designTokenVar(
    "color.feedback.danger.surface",
    "#FDE0E0",
  );
  const CLOCK_OUT_BADGE_TEXT = designTokenVar(
    "color.feedback.danger.base",
    "#B33D47",
  );
  const timeRecorderShellStyles = {
    "--time-recorder-width-md": TIME_RECORDER_WIDTH_MD,
    "--time-recorder-margin-xs": TIME_RECORDER_MARGIN_XS,
    "--time-recorder-surface-bg": TIME_RECORDER_SURFACE_BG,
    "--time-recorder-border-color": TIME_RECORDER_BORDER_COLOR,
    "--time-recorder-border-width": TIME_RECORDER_BORDER_WIDTH,
    "--time-recorder-border-radius": TIME_RECORDER_BORDER_RADIUS,
    "--time-recorder-surface-shadow": TIME_RECORDER_SURFACE_SHADOW,
    "--time-recorder-padding-xs": TIME_RECORDER_PADDING_XS,
    "--time-recorder-padding-md": TIME_RECORDER_PADDING_MD,
    "--badge-padding-x": BADGE_PADDING_X,
    "--badge-padding-y": BADGE_PADDING_Y,
    "--badge-radius": BADGE_RADIUS,
    "--badge-font-weight": BADGE_FONT_WEIGHT,
    "--clock-in-badge-bg": CLOCK_IN_BADGE_BG,
    "--clock-in-badge-text": CLOCK_IN_BADGE_TEXT,
    "--clock-out-badge-bg": CLOCK_OUT_BADGE_BG,
    "--clock-out-badge-text": CLOCK_OUT_BADGE_TEXT,
  } as CSSProperties & Record<`--${string}`, string>;

  const handleClockIn = useCallback(
    () => clockInCallback(cognitoUser, today, clockIn, dispatch, staff, logger),
    [cognitoUser, clockIn, dispatch, staff],
  );

  const handleClockOut = useCallback(
    () =>
      clockOutCallback(cognitoUser, today, clockOut, dispatch, staff, logger),
    [cognitoUser, clockOut, dispatch, staff],
  );

  const handleGoDirectly = useCallback(() => {
    const configured = getStartTime();
    const startIso = dayjs()
      .hour(configured.hour())
      .minute(configured.minute())
      .second(0)
      .millisecond(0)
      .toISOString();

    goDirectlyCallback(
      cognitoUser,
      today,
      staff,
      dispatch,
      clockIn,
      logger,
      startIso,
    );
  }, [
    cognitoUser,
    clockIn,
    dispatch,
    staff,
    today,
    logger,
    getStartTime,
    goDirectlyCallback,
  ]);

  const handleReturnDirectly = useCallback(() => {
    const configured = getEndTime();
    const endIso = dayjs()
      .hour(configured.hour())
      .minute(configured.minute())
      .second(0)
      .millisecond(0)
      .toISOString();

    returnDirectlyCallback(
      cognitoUser,
      today,
      staff,
      dispatch,
      clockOut,
      logger,
      endIso,
    );
  }, [
    cognitoUser,
    staff,
    dispatch,
    clockOut,
    today,
    logger,
    getEndTime,
    returnDirectlyCallback,
  ]);

  const handleRestStart = useCallback(
    () => restStartCallback(cognitoUser, today, dispatch, restStart, logger),
    [cognitoUser, restStart, dispatch],
  );

  const handleRestEnd = useCallback(
    () => restEndCallback(cognitoUser, today, restEnd, dispatch, logger),
    [cognitoUser, restEnd, dispatch],
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
            workDate: { eq: today },
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
  }, [cognitoUser?.id, logger, refreshTimeRecorderData, today]);

  if (attendanceLoading || calendarLoading || workStatus === undefined) {
    return (
      <div
        className="mx-auto box-border w-full max-w-[var(--time-recorder-width-md)] px-[var(--time-recorder-margin-xs)] md:px-0"
        style={timeRecorderShellStyles}
      >
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
          aria-label="勤怠打刻を読み込み中"
        >
          <div className="h-full w-1/3 animate-pulse rounded-full bg-emerald-600" />
        </div>
      </div>
    );
  }

  if (workStatus === null) {
    dispatch(setSnackbarError(MESSAGE_CODE.E00001));
    return <></>;
  }

  return (
    <div
      className="mx-auto box-border w-full max-w-[var(--time-recorder-width-md)] px-[var(--time-recorder-margin-xs)] md:px-0"
      style={timeRecorderShellStyles}
    >
      <div className="rounded-[var(--time-recorder-border-radius)] border-[var(--time-recorder-border-width)] border-[var(--time-recorder-border-color)] bg-[var(--time-recorder-surface-bg)] px-[var(--time-recorder-padding-xs)] py-[var(--time-recorder-padding-xs)] shadow-[var(--time-recorder-surface-shadow)] md:px-[var(--time-recorder-padding-md)] md:py-[var(--time-recorder-padding-md)]">
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <h2
              className="m-0 text-center text-2xl font-normal leading-tight"
              data-testid="work-status-text"
            >
              {workStatus.text || "読み込み中..."}
            </h2>
            {(clockInDisplayText || clockOutDisplayText) && (
              <div className="mt-2 flex justify-center gap-2">
                {clockInDisplayText && (
                  <p
                    className="m-0 inline-block rounded-[var(--badge-radius)] bg-[var(--clock-in-badge-bg)] px-[var(--badge-padding-x)] py-[var(--badge-padding-y)] text-center text-base font-[var(--badge-font-weight)] text-[color:var(--clock-in-badge-text)]"
                    data-testid="clock-in-time-text"
                  >
                    {clockInDisplayText}
                  </p>
                )}
                {clockOutDisplayText && (
                  <p
                    className="m-0 inline-block rounded-[var(--badge-radius)] bg-[var(--clock-out-badge-bg)] px-[var(--badge-padding-x)] py-[var(--badge-padding-y)] text-center text-base font-[var(--badge-font-weight)] text-[color:var(--clock-out-badge-text)]"
                    data-testid="clock-out-time-text"
                  >
                    {clockOutDisplayText}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="col-span-2">
            <Clock />
          </div>
          <div className="col-span-2">
            <label className="inline-flex items-center gap-2">
              <DirectSwitch
                checked={directMode}
                onChange={(event) => setDirectMode(event.target.checked)}
                inputProps={
                  {
                    "data-testid": "direct-mode-switch",
                  } as React.InputHTMLAttributes<HTMLInputElement>
                }
              />
              <span>直行/直帰モード</span>
            </label>
          </div>
          <div className="flex justify-center">
            {directMode ? (
              <GoDirectlyItem
                workStatus={workStatus}
                onClick={handleGoDirectly}
              />
            ) : (
              <ClockInItem
                workStatus={workStatus}
                onClick={handleClockIn}
                disabled={hasChangeRequest}
              />
            )}
          </div>
          <div className="flex justify-center">
            {directMode ? (
              <ReturnDirectly
                workStatus={workStatus}
                onClick={handleReturnDirectly}
              />
            ) : (
              <ClockOutItem
                workStatus={workStatus}
                onClick={handleClockOut}
                disabled={hasChangeRequest}
              />
            )}
          </div>

          {/* 休憩 */}
          <div className="flex justify-center">
            <RestStartItem
              workStatus={workStatus}
              onClick={handleRestStart}
              disabled={hasChangeRequest}
            />
          </div>
          <div className="flex justify-center">
            <RestEndItem
              workStatus={workStatus}
              onClick={handleRestEnd}
              disabled={hasChangeRequest}
            />
          </div>

          {hasChangeRequest && (
            <div
              role="alert"
              className="col-span-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950"
            >
                変更リクエスト申請中です。承認されるまで打刻はできません。
            </div>
          )}

          <div className="col-span-2">
            <QuickDailyReportCard staffId={staff?.id ?? null} date={today} />
          </div>
          {isAttendanceError && (
            <div className="col-span-2">
              <AttendanceErrorAlert />
            </div>
          )}

          <TimeElapsedErrorDialog isTimeElapsedError={isTimeElapsedError} />

          <div className="col-span-2">
            <RestTimeMessage />
          </div>
        </div>
      </div>
    </div>
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
