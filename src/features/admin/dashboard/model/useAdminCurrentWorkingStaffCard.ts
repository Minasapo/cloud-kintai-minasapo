import { GraphQLResult } from "aws-amplify/api";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";

import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import { listAttendances } from "@/shared/api/graphql/documents/queries";
import {
  onCreateAttendance,
  onDeleteAttendance,
  onUpdateAttendance,
} from "@/shared/api/graphql/documents/subscriptions";
import {
  ListAttendancesQuery,
  OnCreateAttendanceSubscription,
  OnDeleteAttendanceSubscription,
  OnUpdateAttendanceSubscription,
} from "@/shared/api/graphql/types";
import { createLogger } from "@/shared/lib/logger";

import { isAttendanceCurrentWorking } from "../lib/adminDashboardSelectors";

const logger = createLogger("useAdminCurrentWorkingStaffCard");

export function useAdminCurrentWorkingStaffCard() {
  const [currentWorkingStaffCount, setCurrentWorkingStaffCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const targetWorkDate = useMemo(() => dayjs().format("YYYY-MM-DD"), []);

  const fetchCurrentWorkingStaffCount = useCallback(async () => {
    setIsLoading(true);
    try {
      let nextToken: string | null = null;
      const currentWorkingStaffIds = new Set<string>();
      do {
        const response = (await graphqlClient.graphql({
          query: listAttendances,
          variables: {
            limit: 200,
            filter: { workDate: { eq: targetWorkDate } },
            nextToken,
          },
          authMode: "userPool",
        })) as GraphQLResult<ListAttendancesQuery>;
        if (response.errors?.length) throw new Error(response.errors[0].message);
        const connection = response.data?.listAttendances;
        const items = connection?.items ?? [];
        items.forEach((attendance) => {
          if (!attendance?.staffId) return;
          if (!isAttendanceCurrentWorking(attendance)) return;
          currentWorkingStaffIds.add(attendance.staffId);
        });
        nextToken = connection?.nextToken ?? null;
      } while (nextToken);
      setCurrentWorkingStaffCount(currentWorkingStaffIds.size);
    } catch (error) {
      logger.error("Failed to fetch current working staff count", error);
      setCurrentWorkingStaffCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [targetWorkDate]);

  useEffect(() => {
    void fetchCurrentWorkingStaffCount();
  }, [fetchCurrentWorkingStaffCount]);

  useEffect(() => {
    let isMounted = true;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRefresh = (workDate?: string | null) => {
      if (workDate !== targetWorkDate) return;
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        if (!isMounted) return;
        void fetchCurrentWorkingStaffCount();
      }, 300);
    };

    const createSubscription = graphqlClient
      .graphql({ query: onCreateAttendance, authMode: "userPool" })
      .subscribe({
        next: ({ data }: { data?: OnCreateAttendanceSubscription }) =>
          scheduleRefresh(data?.onCreateAttendance?.workDate),
        error: (error: unknown) => logger.error("Attendance create subscription error", error),
      });

    const updateSubscription = graphqlClient
      .graphql({ query: onUpdateAttendance, authMode: "userPool" })
      .subscribe({
        next: ({ data }: { data?: OnUpdateAttendanceSubscription }) =>
          scheduleRefresh(data?.onUpdateAttendance?.workDate),
        error: (error: unknown) => logger.error("Attendance update subscription error", error),
      });

    const deleteSubscription = graphqlClient
      .graphql({ query: onDeleteAttendance, authMode: "userPool" })
      .subscribe({
        next: ({ data }: { data?: OnDeleteAttendanceSubscription }) =>
          scheduleRefresh(data?.onDeleteAttendance?.workDate),
        error: (error: unknown) => logger.error("Attendance delete subscription error", error),
      });

    return () => {
      isMounted = false;
      if (refreshTimer) clearTimeout(refreshTimer);
      createSubscription.unsubscribe();
      updateSubscription.unsubscribe();
      deleteSubscription.unsubscribe();
    };
  }, [fetchCurrentWorkingStaffCount, targetWorkDate]);

  return useMemo(
    () => ({
      countLabel: isLoading ? "集計中" : `${currentWorkingStaffCount}人`,
      infoLabel: `${targetWorkDate} 時点の勤務中・休憩中スタッフ数`,
      isLoading,
    }),
    [currentWorkingStaffCount, isLoading, targetWorkDate],
  );
}
