import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import {
  onCreateAttendance,
  onDeleteAttendance,
  onUpdateAttendance,
} from "@shared/api/graphql/documents/subscriptions";
import {
  OnCreateAttendanceSubscription,
  OnDeleteAttendanceSubscription,
  OnUpdateAttendanceSubscription,
} from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { useEffect } from "react";

import { shouldRefetchForAttendanceEvent } from "./attendanceListUtils";

type UseAttendanceSubscriptionParams = {
  currentStaffId: string | undefined;
  shouldFetchAttendances: boolean;
  startDate: string;
  endDate: string;
  refetchAttendances: () => Promise<unknown>;
};

export function useAttendanceSubscription({
  currentStaffId,
  shouldFetchAttendances,
  startDate,
  endDate,
  refetchAttendances,
}: UseAttendanceSubscriptionParams) {
  useEffect(() => {
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
    currentStaffId,
    shouldFetchAttendances,
    startDate,
    endDate,
    refetchAttendances,
  ]);
}
