import { hasUnapprovedChangeRequest } from "@entities/attendance/lib/ChangeRequest";
import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import { listAttendances } from "@shared/api/graphql/documents/queries";
import {
  onCreateAttendance,
  onDeleteAttendance,
  onUpdateAttendance,
} from "@shared/api/graphql/documents/subscriptions";
import { ListAttendancesQuery } from "@shared/api/graphql/types";
import { createLogger } from "@shared/lib/logger";
import { GraphQLResult } from "aws-amplify/api";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";

const logger = createLogger("usePendingAttendanceCount");
const ATTENDANCE_LOOKBACK_DAYS = 30;

export function usePendingAttendanceCount(
  isAuthenticated: boolean,
  isAdminUser: boolean,
) {
  const [pendingAttendanceCount, setPendingAttendanceCount] = useState(0);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const fetchPendingAttendanceCount = useCallback(async () => {
    if (!isAuthenticated || !isAdminUser) {
      return 0;
    }

    const sinceWorkDate = dayjs()
      .subtract(ATTENDANCE_LOOKBACK_DAYS, "day")
      .format("YYYY-MM-DD");

    let nextToken: string | null = null;
    const pendingEntryKeys = new Set<string>();

    do {
      const response = (await graphqlClient.graphql({
        query: listAttendances,
        variables: {
          limit: 100,
          filter: {
            workDate: {
              ge: sinceWorkDate,
            },
          },
          nextToken,
        },
        authMode: "userPool",
      })) as GraphQLResult<ListAttendancesQuery>;

      if (response.errors?.length) {
        throw new Error(response.errors[0].message);
      }

      const connection = response.data?.listAttendances;
      const items = connection?.items ?? [];

      items.forEach((attendance) => {
        if (!attendance?.staffId) {
          return;
        }

        if (!hasUnapprovedChangeRequest(attendance.changeRequests)) {
          return;
        }

        const workDate = attendance.workDate ?? "";
        const entryKey = `${attendance.staffId}:${workDate}`;
        pendingEntryKeys.add(entryKey);
      });

      nextToken = connection?.nextToken ?? null;
    } while (nextToken);

    return pendingEntryKeys.size;
  }, [isAdminUser, isAuthenticated]);

  const recalculatePendingAttendanceCount = useCallback(async () => {
    setAttendanceLoading(true);

    try {
      const count = await fetchPendingAttendanceCount();
      setPendingAttendanceCount(count);
    } catch (error) {
      logger.error("Failed to fetch pending attendance count", error);
    } finally {
      setAttendanceLoading(false);
    }
  }, [fetchPendingAttendanceCount]);

  useEffect(() => {
    if (!isAuthenticated || !isAdminUser) {
      setPendingAttendanceCount(0);
      setAttendanceLoading(false);
      return;
    }

    void recalculatePendingAttendanceCount();
  }, [isAdminUser, isAuthenticated, recalculatePendingAttendanceCount]);

  useEffect(() => {
    if (!isAuthenticated || !isAdminUser) {
      return;
    }

    let isMounted = true;
    let recalculateTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRecalculate = () => {
      if (recalculateTimer) {
        clearTimeout(recalculateTimer);
      }

      recalculateTimer = setTimeout(() => {
        if (!isMounted) {
          return;
        }

        void recalculatePendingAttendanceCount();
      }, 300);
    };

    const createSubscription = graphqlClient
      .graphql({
        query: onCreateAttendance,
        authMode: "userPool",
      })
      .subscribe({
        next: () => {
          scheduleRecalculate();
        },
        error: (error: unknown) => {
          logger.error("Attendance create subscription error", error);
        },
      });

    const updateSubscription = graphqlClient
      .graphql({
        query: onUpdateAttendance,
        authMode: "userPool",
      })
      .subscribe({
        next: () => {
          scheduleRecalculate();
        },
        error: (error: unknown) => {
          logger.error("Attendance update subscription error", error);
        },
      });

    const deleteSubscription = graphqlClient
      .graphql({
        query: onDeleteAttendance,
        authMode: "userPool",
      })
      .subscribe({
        next: () => {
          scheduleRecalculate();
        },
        error: (error: unknown) => {
          logger.error("Attendance delete subscription error", error);
        },
      });

    const subscriptions = [
      createSubscription,
      updateSubscription,
      deleteSubscription,
    ];

    return () => {
      isMounted = false;

      if (recalculateTimer) {
        clearTimeout(recalculateTimer);
      }

      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, [isAdminUser, isAuthenticated, recalculatePendingAttendanceCount]);

  return {
    pendingAttendanceCount,
    attendanceLoading,
  };
}
