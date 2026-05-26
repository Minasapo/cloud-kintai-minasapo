import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import {
  onCreateAttendance,
  onCreateDailyReport,
  onDeleteAttendance,
  onDeleteDailyReport,
  onUpdateAttendance,
  onUpdateDailyReport,
} from "@shared/api/graphql/documents/subscriptions";
import type {
  OnCreateAttendanceSubscription,
  OnCreateDailyReportSubscription,
  OnDeleteAttendanceSubscription,
  OnDeleteDailyReportSubscription,
  OnUpdateAttendanceSubscription,
  OnUpdateDailyReportSubscription,
} from "@shared/api/graphql/types";
import { createLogger } from "@shared/lib/logger";
import dayjs, { type Dayjs } from "dayjs";
import { useEffect } from "react";

const logger = createLogger("AdminDashboard");

type SubscriptionParams = {
  isAuthenticated: boolean;
  targetWorkDate: string;
  aggregationStart: Dayjs;
  aggregationEnd: Dayjs;
  fetchCurrentWorkingStaffCount: () => Promise<void>;
  fetchPeriodAttendances: () => Promise<void>;
  fetchTodayDailyReportStatus: () => Promise<void>;
};

export function useAdminDashboardSubscriptions({
  isAuthenticated,
  targetWorkDate,
  aggregationStart,
  aggregationEnd,
  fetchCurrentWorkingStaffCount,
  fetchPeriodAttendances,
  fetchTodayDailyReportStatus,
}: SubscriptionParams) {
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isMounted = true;
    let currentWorkingTimer: ReturnType<typeof setTimeout> | null = null;
    let periodAttendancesTimer: ReturnType<typeof setTimeout> | null = null;
    let dailyReportTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleCurrentWorkingRefresh = () => {
      if (currentWorkingTimer) clearTimeout(currentWorkingTimer);
      currentWorkingTimer = setTimeout(() => { if (isMounted) void fetchCurrentWorkingStaffCount(); }, 300);
    };

    const schedulePeriodAttendanceRefresh = () => {
      if (periodAttendancesTimer) clearTimeout(periodAttendancesTimer);
      periodAttendancesTimer = setTimeout(() => { if (isMounted) void fetchPeriodAttendances(); }, 300);
    };

    const scheduleDailyReportRefresh = () => {
      if (dailyReportTimer) clearTimeout(dailyReportTimer);
      dailyReportTimer = setTimeout(() => { if (isMounted) void fetchTodayDailyReportStatus(); }, 300);
    };

    const handleAttendanceEvent = (attendance?: { workDate?: string | null } | null) => {
      const workDate = attendance?.workDate;
      if (!workDate) return;
      if (workDate === targetWorkDate) scheduleCurrentWorkingRefresh();
      if (dayjs(workDate).isBetween(aggregationStart, aggregationEnd, "day", "[]")) schedulePeriodAttendanceRefresh();
    };

    const handleDailyReportEvent = (dailyReport?: { reportDate?: string | null } | null) => {
      if (dailyReport?.reportDate !== targetWorkDate) return;
      scheduleDailyReportRefresh();
    };

    const createAttendanceSub = graphqlClient
      .graphql({ query: onCreateAttendance, authMode: "userPool" })
      .subscribe({ next: ({ data }: { data?: OnCreateAttendanceSubscription }) => handleAttendanceEvent(data?.onCreateAttendance), error: (e: unknown) => logger.error("Attendance create subscription error", e) });

    const updateAttendanceSub = graphqlClient
      .graphql({ query: onUpdateAttendance, authMode: "userPool" })
      .subscribe({ next: ({ data }: { data?: OnUpdateAttendanceSubscription }) => handleAttendanceEvent(data?.onUpdateAttendance), error: (e: unknown) => logger.error("Attendance update subscription error", e) });

    const deleteAttendanceSub = graphqlClient
      .graphql({ query: onDeleteAttendance, authMode: "userPool" })
      .subscribe({ next: ({ data }: { data?: OnDeleteAttendanceSubscription }) => handleAttendanceEvent(data?.onDeleteAttendance), error: (e: unknown) => logger.error("Attendance delete subscription error", e) });

    const createDailyReportSub = graphqlClient
      .graphql({ query: onCreateDailyReport, authMode: "userPool" })
      .subscribe({ next: ({ data }: { data?: OnCreateDailyReportSubscription }) => handleDailyReportEvent(data?.onCreateDailyReport), error: (e: unknown) => logger.error("Daily report create subscription error", e) });

    const updateDailyReportSub = graphqlClient
      .graphql({ query: onUpdateDailyReport, authMode: "userPool" })
      .subscribe({ next: ({ data }: { data?: OnUpdateDailyReportSubscription }) => handleDailyReportEvent(data?.onUpdateDailyReport), error: (e: unknown) => logger.error("Daily report update subscription error", e) });

    const deleteDailyReportSub = graphqlClient
      .graphql({ query: onDeleteDailyReport, authMode: "userPool" })
      .subscribe({ next: ({ data }: { data?: OnDeleteDailyReportSubscription }) => handleDailyReportEvent(data?.onDeleteDailyReport), error: (e: unknown) => logger.error("Daily report delete subscription error", e) });

    return () => {
      isMounted = false;
      if (currentWorkingTimer) clearTimeout(currentWorkingTimer);
      if (periodAttendancesTimer) clearTimeout(periodAttendancesTimer);
      if (dailyReportTimer) clearTimeout(dailyReportTimer);
      createAttendanceSub.unsubscribe();
      updateAttendanceSub.unsubscribe();
      deleteAttendanceSub.unsubscribe();
      createDailyReportSub.unsubscribe();
      updateDailyReportSub.unsubscribe();
      deleteDailyReportSub.unsubscribe();
    };
  }, [
    aggregationEnd,
    aggregationStart,
    fetchCurrentWorkingStaffCount,
    fetchPeriodAttendances,
    fetchTodayDailyReportStatus,
    isAuthenticated,
    targetWorkDate,
  ]);
}
