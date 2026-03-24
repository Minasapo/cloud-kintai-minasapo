import { Tooltip } from "@mui/material";
import { GraphQLResult } from "aws-amplify/api";
import dayjs from "dayjs";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import { hasUnapprovedChangeRequest } from "@/entities/attendance/lib/ChangeRequest";
import { StaffRole } from "@/entities/staff/model/useStaffs/useStaffs";
import useWorkflows from "@/entities/workflow/model/useWorkflows";
import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import { listAttendances } from "@/shared/api/graphql/documents/queries";
import {
  onCreateAttendance,
  onDeleteAttendance,
  onUpdateAttendance,
} from "@/shared/api/graphql/documents/subscriptions";
import {
  ListAttendancesQuery,
  Workflow,
  WorkflowStatus,
} from "@/shared/api/graphql/types";
import { createLogger } from "@/shared/lib/logger";

const logger = createLogger("AdminPendingApprovalSummary");
const ATTENDANCE_LOOKBACK_DAYS = 30;

const isWorkflowPendingForCurrentAdmin = (workflow: Workflow) => {
  const isUnapprovedStatus =
    workflow.status === WorkflowStatus.SUBMITTED ||
    workflow.status === WorkflowStatus.PENDING;

  if (!isUnapprovedStatus) {
    return false;
  }

  return true;
};

export default function AdminPendingApprovalSummary() {
  const { authStatus, isCognitoUserRole } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";

  const isAdminUser = useMemo(
    () =>
      isCognitoUserRole(StaffRole.ADMIN) ||
      isCognitoUserRole(StaffRole.STAFF_ADMIN) ||
      isCognitoUserRole(StaffRole.OWNER),
    [isCognitoUserRole],
  );

  const { workflows } = useWorkflows({ isAuthenticated });

  const [pendingAttendanceCount, setPendingAttendanceCount] = useState(0);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const pendingWorkflowCount = useMemo(() => {
    if (!isAdminUser || !workflows) {
      return 0;
    }

    return workflows.filter((workflow) =>
      isWorkflowPendingForCurrentAdmin(workflow),
    ).length;
  }, [isAdminUser, workflows]);

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
    let recalcTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRecalc = () => {
      if (recalcTimer) {
        clearTimeout(recalcTimer);
      }

      recalcTimer = setTimeout(() => {
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
          scheduleRecalc();
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
          scheduleRecalc();
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
          scheduleRecalc();
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

      if (recalcTimer) {
        clearTimeout(recalcTimer);
      }

      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, [isAdminUser, isAuthenticated, recalculatePendingAttendanceCount]);

  if (!isAuthenticated || !isAdminUser) {
    return null;
  }

  const attendanceCountLabel = attendanceLoading
    ? "集計中"
    : `${pendingAttendanceCount}件`;
  const workflowCountLabel = `${pendingWorkflowCount}件`;

  return (
    <div
      data-testid="admin-pending-approval-summary"
      className="grid grid-cols-2 gap-4"
    >
      <AdminSummaryCard
        testId="admin-pending-attendance-card"
        title="勤怠修正申請"
        description="未承認の勤怠修正申請"
        countLabel={attendanceCountLabel}
        to="/admin/attendances"
      />
      <AdminSummaryCard
        testId="admin-pending-workflow-card"
        title="ワークフロー申請"
        description="未承認のワークフロー申請"
        countLabel={workflowCountLabel}
        to="/admin/workflow"
      />
    </div>
  );
}

function AdminSummaryCard({
  testId,
  title,
  description,
  countLabel,
  to,
}: {
  testId: string;
  title: string;
  description: string;
  countLabel: string;
  to: string;
}) {
  return (
    <RouterLink
      to={to}
      data-testid={testId}
      className="group block rounded-[1.35rem] no-underline transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/70 hover:no-underline"
    >
      <section className="relative h-full rounded-[1.35rem] border border-slate-200/80 bg-white p-4 shadow-[0_18px_32px_-28px_rgba(15,23,42,0.4)] transition group-hover:border-slate-300 group-hover:shadow-[0_22px_36px_-28px_rgba(15,23,42,0.5)]">
        <Tooltip title={description} arrow>
          <span
            data-testid={`${testId}-description-tooltip`}
            aria-label={description}
            className="absolute right-3 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] font-semibold leading-none text-slate-600"
          >
            i
          </span>
        </Tooltip>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 pr-7">
            <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold leading-none tracking-[0.01em] text-slate-700">
              管理者のみ
            </span>
            <h2 className="mt-2 m-0 text-sm font-semibold tracking-[0.01em] text-slate-900">
              {title}
            </h2>
          </div>
          <p className="m-0 mt-7 shrink-0 text-4xl font-extrabold leading-none tracking-[-0.03em] text-slate-950 md:text-5xl">
            {countLabel}
          </p>
        </div>
      </section>
    </RouterLink>
  );
}
