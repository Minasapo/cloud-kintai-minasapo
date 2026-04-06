import { GraphQLResult } from "aws-amplify/api";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";

import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import { listDailyReports } from "@/shared/api/graphql/documents/queries";
import {
  onCreateDailyReport,
  onDeleteDailyReport,
  onUpdateDailyReport,
} from "@/shared/api/graphql/documents/subscriptions";
import {
  DailyReportStatus,
  ListDailyReportsQuery,
  OnCreateDailyReportSubscription,
  OnDeleteDailyReportSubscription,
  OnUpdateDailyReportSubscription,
} from "@/shared/api/graphql/types";
import { createLogger } from "@/shared/lib/logger";

const logger = createLogger("useAdminDailyReportStatusCard");

export function useAdminDailyReportStatusCard() {
  const [submittedDailyReportCount, setSubmittedDailyReportCount] = useState(0);
  const [approvedDailyReportCount, setApprovedDailyReportCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const targetWorkDate = useMemo(() => dayjs().format("YYYY-MM-DD"), []);

  const fetchTodayDailyReportStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      let nextToken: string | null = null;
      const submittedStaffIds = new Set<string>();
      const approvedStaffIds = new Set<string>();
      do {
        const response = (await graphqlClient.graphql({
          query: listDailyReports,
          variables: {
            limit: 200,
            filter: { reportDate: { eq: targetWorkDate } },
            nextToken,
          },
          authMode: "userPool",
        })) as GraphQLResult<ListDailyReportsQuery>;
        if (response.errors?.length) throw new Error(response.errors[0].message);
        const connection = response.data?.listDailyReports;
        const items = connection?.items ?? [];
        items.forEach((dailyReport) => {
          if (!dailyReport?.staffId) return;
          if (dailyReport.status === DailyReportStatus.APPROVED) {
            approvedStaffIds.add(dailyReport.staffId);
            submittedStaffIds.add(dailyReport.staffId);
            return;
          }
          if (dailyReport.status === DailyReportStatus.SUBMITTED) {
            submittedStaffIds.add(dailyReport.staffId);
          }
        });
        nextToken = connection?.nextToken ?? null;
      } while (nextToken);
      setSubmittedDailyReportCount(submittedStaffIds.size);
      setApprovedDailyReportCount(approvedStaffIds.size);
    } catch (error) {
      logger.error("Failed to fetch today daily report status", error);
      setSubmittedDailyReportCount(0);
      setApprovedDailyReportCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [targetWorkDate]);

  useEffect(() => {
    void fetchTodayDailyReportStatus();
  }, [fetchTodayDailyReportStatus]);

  useEffect(() => {
    let isMounted = true;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRefresh = (reportDate?: string | null) => {
      if (reportDate !== targetWorkDate) return;
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        if (!isMounted) return;
        void fetchTodayDailyReportStatus();
      }, 300);
    };

    const createSubscription = graphqlClient
      .graphql({ query: onCreateDailyReport, authMode: "userPool" })
      .subscribe({
        next: ({ data }: { data?: OnCreateDailyReportSubscription }) =>
          scheduleRefresh(data?.onCreateDailyReport?.reportDate),
        error: (error: unknown) => logger.error("Daily report create subscription error", error),
      });

    const updateSubscription = graphqlClient
      .graphql({ query: onUpdateDailyReport, authMode: "userPool" })
      .subscribe({
        next: ({ data }: { data?: OnUpdateDailyReportSubscription }) =>
          scheduleRefresh(data?.onUpdateDailyReport?.reportDate),
        error: (error: unknown) => logger.error("Daily report update subscription error", error),
      });

    const deleteSubscription = graphqlClient
      .graphql({ query: onDeleteDailyReport, authMode: "userPool" })
      .subscribe({
        next: ({ data }: { data?: OnDeleteDailyReportSubscription }) =>
          scheduleRefresh(data?.onDeleteDailyReport?.reportDate),
        error: (error: unknown) => logger.error("Daily report delete subscription error", error),
      });

    return () => {
      isMounted = false;
      if (refreshTimer) clearTimeout(refreshTimer);
      createSubscription.unsubscribe();
      updateSubscription.unsubscribe();
      deleteSubscription.unsubscribe();
    };
  }, [fetchTodayDailyReportStatus, targetWorkDate]);

  return useMemo(
    () => ({
      submittedCountLabel: isLoading ? "集計中" : `${submittedDailyReportCount}件`,
      approvedCountLabel: isLoading ? "集計中" : `${approvedDailyReportCount}件`,
      isLoading,
    }),
    [approvedDailyReportCount, isLoading, submittedDailyReportCount],
  );
}
