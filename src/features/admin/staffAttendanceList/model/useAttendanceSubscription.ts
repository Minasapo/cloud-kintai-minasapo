import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import { onCreateAttendance, onDeleteAttendance, onUpdateAttendance } from "@shared/api/graphql/documents/subscriptions";
import type { OnCreateAttendanceSubscription, OnDeleteAttendanceSubscription, OnUpdateAttendanceSubscription } from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { type MutableRefObject,useEffect } from "react";

type AttendanceSubscriptionParams = {
  staffId: string | undefined;
  shouldFetchAttendances: boolean;
  dateRange: { startDate: string; endDate: string };
  refetchAttendances: () => void;
  isBulkApprovingRef: MutableRefObject<boolean>;
};

export function useAttendanceSubscription({
  staffId,
  shouldFetchAttendances,
  dateRange,
  refetchAttendances,
  isBulkApprovingRef,
}: AttendanceSubscriptionParams) {
  useEffect(() => {
    if (!staffId || !shouldFetchAttendances) return;

    let refetchTimer: ReturnType<typeof setTimeout> | null = null;

    const shouldRefetch = (eventStaffId?: string | null, workDate?: string | null) => {
      if (!eventStaffId || !workDate) return false;
      if (eventStaffId !== staffId) return false;
      const eventDate = dayjs(workDate);
      const start = dayjs(dateRange.startDate);
      const end = dayjs(dateRange.endDate);
      return eventDate.isBetween(start, end, "day", "[]");
    };

    const scheduleRefetch = () => {
      if (isBulkApprovingRef.current) return;
      if (refetchTimer) clearTimeout(refetchTimer);
      refetchTimer = setTimeout(() => { void refetchAttendances(); }, 300);
    };

    const createSubscription = graphqlClient
      .graphql({ query: onCreateAttendance, authMode: "userPool" })
      .subscribe({
        next: ({ data }: { data?: OnCreateAttendanceSubscription }) => {
          const attendance = data?.onCreateAttendance;
          if (shouldRefetch(attendance?.staffId, attendance?.workDate)) scheduleRefetch();
        },
      });

    const updateSubscription = graphqlClient
      .graphql({ query: onUpdateAttendance, authMode: "userPool" })
      .subscribe({
        next: ({ data }: { data?: OnUpdateAttendanceSubscription }) => {
          const attendance = data?.onUpdateAttendance;
          if (shouldRefetch(attendance?.staffId, attendance?.workDate)) scheduleRefetch();
        },
      });

    const deleteSubscription = graphqlClient
      .graphql({ query: onDeleteAttendance, authMode: "userPool" })
      .subscribe({
        next: ({ data }: { data?: OnDeleteAttendanceSubscription }) => {
          const attendance = data?.onDeleteAttendance;
          if (shouldRefetch(attendance?.staffId, attendance?.workDate)) scheduleRefetch();
        },
      });

    return () => {
      createSubscription.unsubscribe();
      updateSubscription.unsubscribe();
      deleteSubscription.unsubscribe();
      if (refetchTimer) clearTimeout(refetchTimer);
    };
  }, [staffId, shouldFetchAttendances, dateRange.startDate, dateRange.endDate, refetchAttendances, isBulkApprovingRef]);
}
