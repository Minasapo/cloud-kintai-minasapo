/**
 * スタッフ向けの勤怠一覧ページのコンポーネント。
 * ユーザーの勤怠情報を取得し、デスクトップ・モバイル両方のリストで表示する。
 * MaterialUIを使用し、日付選択や合計勤務時間の表示も行う。
 */
import { useListAttendancesByDateRangeQuery } from "@entities/attendance/api/attendanceApi";
import useCloseDates from "@entities/attendance/model/useCloseDates";
import {
  useGetCompanyHolidayCalendarsQuery,
  useGetHolidayCalendarsQuery,
} from "@entities/calendar/api/calendarApi";
import fetchStaff from "@entities/staff/model/useStaff/fetchStaff";
import {
  LinearProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  OnCreateAttendanceSubscription,
  OnDeleteAttendanceSubscription,
  OnUpdateAttendanceSubscription,
  Staff,
} from "@shared/api/graphql/types";
/**
 * 日付操作ライブラリ。日付のフォーマットや計算に使用。
 */
/**
 * ReactのContext, Hooks。
 */
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";
import {
  calcTotalRestTime,
  calcTotalWorkTime,
} from "@/entities/attendance/lib/time";
import * as MESSAGE_CODE from "@/errors";
import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import {
  onCreateAttendance,
  onDeleteAttendance,
  onUpdateAttendance,
} from "@/shared/api/graphql/documents/subscriptions";
/**
 * AmplifyのLogger。デバッグ・エラー出力に使用。
 */
import { Logger } from "@/shared/lib/logger";
import { setSnackbarError } from "@/shared/lib/store/snackbarSlice";

import DesktopList from "./DesktopList";
import MobileList from "./MobileList/MobileList";

const MONTH_QUERY_KEY = "month";

const getCurrentMonthFromQuery = (monthParam: string | null): Dayjs => {
  if (!monthParam) {
    return dayjs().startOf("month");
  }

  const parsedMonth = dayjs(monthParam, "YYYY-MM", true);
  if (!parsedMonth.isValid()) {
    return dayjs().startOf("month");
  }

  return parsedMonth.startOf("month");
};

/**
 * 勤怠一覧テーブルのメインコンポーネント。
 * ユーザーの勤怠データ取得、合計勤務時間計算、リスト表示を行う。
 * @returns JSX.Element
 */
export default function AttendanceTable() {
  /**
   * 認証済みユーザー情報。
   */
  const { cognitoUser } = useContext(AuthContext);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  /**
   * Reduxのdispatch関数。
   */
  const dispatch = useDispatch();
  /**
   * ページ遷移用navigate関数。
   */
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  /**
   * 勤怠情報取得用カスタムフック。
   */
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

  const effectiveDateRange = useMemo(() => {
    const monthStart = currentMonth.startOf("month");
    const monthEnd = currentMonth.endOf("month");
    const today = dayjs();

    const applicableCloseDates = closeDates.filter((closeDate) => {
      const start = dayjs(closeDate.startDate);
      const end = dayjs(closeDate.endDate);
      return (
        start.isValid() &&
        end.isValid() &&
        !end.isBefore(monthStart, "day") &&
        !start.isAfter(monthEnd, "day")
      );
    });

    if (applicableCloseDates.length > 0) {
      const containsToday = applicableCloseDates.find((cd) => {
        const start = dayjs(cd.startDate);
        const end = dayjs(cd.endDate);
        return !today.isBefore(start, "day") && !today.isAfter(end, "day");
      });

      if (containsToday) {
        return {
          start: dayjs(containsToday.startDate),
          end: dayjs(containsToday.endDate),
          hasValidPeriod: true,
        };
      }

      const latest = applicableCloseDates.reduce((prev, current) => {
        const prevUpdatedAt = dayjs(prev.updatedAt ?? prev.closeDate).valueOf();
        const currentUpdatedAt = dayjs(
          current.updatedAt ?? current.closeDate,
        ).valueOf();
        return currentUpdatedAt > prevUpdatedAt ? current : prev;
      });

      return {
        start: dayjs(latest.startDate),
        end: dayjs(latest.endDate),
        hasValidPeriod: true,
      };
    }

    return {
      start: monthStart,
      end: monthEnd,
      hasValidPeriod: false,
    };
  }, [currentMonth, closeDates]);

  const startDate = effectiveDateRange.start.format(AttendanceDate.DataFormat);
  const endDate = effectiveDateRange.end.format(AttendanceDate.DataFormat);

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

    const shouldRefetch = (
      eventStaffId?: string | null,
      workDate?: string | null,
    ) => {
      if (!eventStaffId || !workDate) return false;
      if (eventStaffId !== currentStaffId) return false;

      const eventDate = dayjs(workDate);
      const start = dayjs(startDate);
      const end = dayjs(endDate);

      return eventDate.isBetween(start, end, "day", "[]");
    };

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
          if (!shouldRefetch(attendance?.staffId, attendance?.workDate)) {
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
          if (!shouldRefetch(attendance?.staffId, attendance?.workDate)) {
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
          if (!shouldRefetch(attendance?.staffId, attendance?.workDate)) {
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

  /**
   * スタッフ情報の状態。
   */
  const logger = useMemo(
    () => new Logger("AttendanceList", import.meta.env.DEV ? "DEBUG" : "ERROR"),
    [],
  );
  const [staff, setStaff] = useState<Staff | null | undefined>(undefined);

  /**
   * ユーザー情報取得・勤怠情報取得の副作用。
   */
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

  /**
   * 勤怠データから合計勤務時間（休憩時間を除く）を計算する。
   * 有効期間内のデータのみを対象とする。
   */
  const totalTime = useMemo(() => {
    // 有効期間内のデータのみをフィルター
    const filteredAttendances = attendances.filter((attendance) => {
      if (!attendance.workDate) return false;
      const workDate = dayjs(attendance.workDate);
      return (
        !workDate.isBefore(effectiveDateRange.start, "day") &&
        !workDate.isAfter(effectiveDateRange.end, "day")
      );
    });

    const totalWorkTime = filteredAttendances.reduce((acc, attendance) => {
      if (!attendance.startTime || !attendance.endTime) return acc;
      const workTime = calcTotalWorkTime(
        attendance.startTime,
        attendance.endTime,
      );
      return acc + workTime;
    }, 0);

    const totalRestTime = filteredAttendances.reduce((acc, attendance) => {
      if (!attendance.rests) return acc;
      const restTime = attendance.rests
        .filter((item): item is NonNullable<typeof item> => !!item)
        .reduce((acc, rest) => {
          if (!rest.startTime || !rest.endTime) return acc;
          return acc + calcTotalRestTime(rest.startTime, rest.endTime);
        }, 0);
      return acc + restTime;
    }, 0);
    return totalWorkTime - totalRestTime;
  }, [attendances, effectiveDateRange]);

  /**
   * 集計期間のラベルを生成する。
   */
  const rangeLabelForDisplay = useMemo(() => {
    const startLabel = effectiveDateRange.start.format(
      AttendanceDate.DisplayFormat,
    );
    const endLabel = effectiveDateRange.end.format(
      AttendanceDate.DisplayFormat,
    );
    return `${startLabel} 〜 ${endLabel}`;
  }, [effectiveDateRange]);

  const monthlyAttendances = useMemo(
    () =>
      attendances.filter((attendance) =>
        attendance.workDate
          ? dayjs(attendance.workDate).isSame(currentMonth, "month")
          : false,
      ),
    [attendances, currentMonth],
  );

  const alertDays = useMemo(() => {
    if (!staff) return 0;
    return monthlyAttendances.filter((attendance) => {
      const hasSystemComment =
        Array.isArray(attendance.systemComments) && attendance.systemComments.length > 0;
      return hasSystemComment;
    }).length;
  }, [monthlyAttendances, staff]);

  if (attendanceLoading || calendarLoading || closeDatesLoading) {
    return <LinearProgress />;
  }

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <section className="rounded-[1.8rem] border border-emerald-100/80 bg-[linear-gradient(135deg,#f7fcf8_0%,#ecfdf5_58%,#ffffff_100%)] p-5 shadow-[0_28px_60px_-42px_rgba(15,23,42,0.35)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-[1.85rem] font-semibold tracking-tight text-slate-950 sm:text-[2.2rem]">
              勤怠一覧
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-[0.95rem]">
              月ごとの勤怠をカレンダーで確認しながら、必要な日付の編集にすぐ移れます。集計期間の勤務時間もこの画面でまとめて確認できます。
            </p>
          </div>
          <div className="rounded-[1.2rem] border border-emerald-100 bg-white/80 px-4 py-3 shadow-[0_18px_42px_-36px_rgba(15,23,42,0.35)]">
            <p className="text-xs font-semibold tracking-[0.04em] text-slate-500">
              集計期間
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">{rangeLabelForDisplay}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[1.6rem] border border-emerald-100/80 bg-white/90 p-4 shadow-[0_24px_54px_-40px_rgba(15,23,42,0.35)]">
          <p className="text-xs font-medium tracking-[0.04em] text-slate-500">合計勤務時間</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">{totalTime.toFixed(1)}h</p>
        </div>
        <div className="rounded-[1.6rem] border border-emerald-100/80 bg-white/90 p-4 shadow-[0_24px_54px_-40px_rgba(15,23,42,0.35)]">
          <p className="text-xs font-medium tracking-[0.04em] text-slate-500">打刻日数</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{monthlyAttendances.length}</p>
        </div>
        <div className="rounded-[1.6rem] border border-emerald-100/80 bg-white/90 p-4 shadow-[0_24px_54px_-40px_rgba(15,23,42,0.35)]">
          <p className="text-xs font-medium tracking-[0.04em] text-slate-500">要確認日数</p>
          <p className="mt-2 text-2xl font-semibold text-amber-700">{alertDays}</p>
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-emerald-100/80 bg-white/90 p-4 shadow-[0_24px_54px_-40px_rgba(15,23,42,0.35)] sm:p-5">
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
      </div>
    </div>
  );
}
