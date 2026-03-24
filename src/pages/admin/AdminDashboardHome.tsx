import { Stack, Tooltip, Typography } from "@mui/material";
import { GraphQLResult } from "aws-amplify/api";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartOptions,
  Legend,
  LinearScale,
  Tooltip as ChartTooltip,
} from "chart.js";
import dayjs from "dayjs";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AuthContext } from "@/context/AuthContext";
import {
  getWorkStatus,
  WorkStatusCodes,
} from "@/entities/attendance/lib/actions/workStatus";
import { calcTotalRestTime, calcTotalWorkTime } from "@/entities/attendance/lib/time";
import useCloseDates from "@/entities/attendance/model/useCloseDates";
import { useStaffs } from "@/entities/staff/model/useStaffs/useStaffs";
import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import {
  listAttendances,
  listDailyReports,
} from "@/shared/api/graphql/documents/queries";
import {
  Attendance,
  DailyReportStatus,
  ListAttendancesQuery,
  ListDailyReportsQuery,
} from "@/shared/api/graphql/types";
import { designTokenVar } from "@/shared/designSystem";
import { createLogger } from "@/shared/lib/logger";
import { PageSection } from "@/shared/ui/layout";
import AdminPendingApprovalSummary from "@/widgets/layout/header/AdminPendingApprovalSummary";

const PAGE_PADDING_X = {
  xs: designTokenVar("spacing.lg", "16px"),
  md: designTokenVar("spacing.xxl", "32px"),
};

const PAGE_PADDING_Y = {
  xs: designTokenVar("spacing.xl", "24px"),
  md: designTokenVar("spacing.xxl", "32px"),
};

const PAGE_SECTION_GAP = designTokenVar("spacing.lg", "16px");
const logger = createLogger("AdminDashboardHome");
ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTooltip, Legend);

const isAttendanceCurrentWorking = (attendance: Attendance) => {
  const { code } = getWorkStatus(attendance);
  return code === WorkStatusCodes.WORKING || code === WorkStatusCodes.RESTING;
};

const resolveAggregationDateRange = (
  month: dayjs.Dayjs,
  closeDates: Array<{
    startDate?: string | null;
    endDate?: string | null;
    updatedAt?: string | null;
    closeDate?: string | null;
  }>,
) => {
  const monthStart = month.startOf("month");
  const monthEnd = month.endOf("month");
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
    const containsToday = applicableCloseDates.find((item) => {
      const start = dayjs(item.startDate);
      const end = dayjs(item.endDate);
      return !today.isBefore(start, "day") && !today.isAfter(end, "day");
    });

    if (containsToday) {
      return {
        start: dayjs(containsToday.startDate),
        end: dayjs(containsToday.endDate),
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
    };
  }

  return {
    start: monthStart,
    end: monthEnd,
  };
};

export default function AdminDashboardHome() {
  const { authStatus } = useContext(AuthContext);
  const { getStandardWorkHours } = useContext(AppConfigContext);
  const isAuthenticated = authStatus === "authenticated";
  const { staffs, loading: staffLoading } = useStaffs({ isAuthenticated });
  const { closeDates, loading: closeDatesLoading } = useCloseDates();
  const [currentWorkingStaffCount, setCurrentWorkingStaffCount] =
    useState<number>(0);
  const [isLoadingCurrentWorkingStaffCount, setIsLoadingCurrentWorkingStaffCount] =
    useState(false);
  const [periodAttendances, setPeriodAttendances] = useState<Attendance[]>([]);
  const [isLoadingPeriodAttendances, setIsLoadingPeriodAttendances] =
    useState(false);
  const [submittedDailyReportCount, setSubmittedDailyReportCount] =
    useState<number>(0);
  const [approvedDailyReportCount, setApprovedDailyReportCount] =
    useState<number>(0);
  const [isLoadingDailyReportStatus, setIsLoadingDailyReportStatus] =
    useState(false);

  const targetWorkDate = useMemo(() => dayjs().format("YYYY-MM-DD"), []);
  const currentMonth = useMemo(() => dayjs().startOf("month"), []);
  const aggregationDateRange = useMemo(
    () => resolveAggregationDateRange(currentMonth, closeDates),
    [closeDates, currentMonth],
  );
  const aggregationStartDate = useMemo(
    () => aggregationDateRange.start.format("YYYY-MM-DD"),
    [aggregationDateRange],
  );
  const aggregationEndDate = useMemo(
    () => aggregationDateRange.end.format("YYYY-MM-DD"),
    [aggregationDateRange],
  );

  const fetchCurrentWorkingStaffCount = useCallback(async () => {
    setIsLoadingCurrentWorkingStaffCount(true);

    try {
      let nextToken: string | null = null;
      const currentWorkingStaffIds = new Set<string>();

      do {
        const response = (await graphqlClient.graphql({
          query: listAttendances,
          variables: {
            limit: 200,
            filter: {
              workDate: {
                eq: targetWorkDate,
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
          if (!attendance) {
            return;
          }

          if (!attendance.staffId) {
            return;
          }

          if (!isAttendanceCurrentWorking(attendance)) {
            return;
          }

          currentWorkingStaffIds.add(attendance.staffId);
        });

        nextToken = connection?.nextToken ?? null;
      } while (nextToken);

      setCurrentWorkingStaffCount(currentWorkingStaffIds.size);
    } catch (error) {
      logger.error("Failed to fetch current working staff count", error);
      setCurrentWorkingStaffCount(0);
    } finally {
      setIsLoadingCurrentWorkingStaffCount(false);
    }
  }, [targetWorkDate]);

  const fetchPeriodAttendances = useCallback(async () => {
    setIsLoadingPeriodAttendances(true);

    try {
      let nextToken: string | null = null;
      const fetchedAttendances: Attendance[] = [];

      do {
        const response = (await graphqlClient.graphql({
          query: listAttendances,
          variables: {
            limit: 200,
            filter: {
              workDate: {
                ge: aggregationStartDate,
                le: aggregationEndDate,
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
          if (attendance) {
            fetchedAttendances.push(attendance);
          }
        });

        nextToken = connection?.nextToken ?? null;
      } while (nextToken);

      setPeriodAttendances(fetchedAttendances);
    } catch (error) {
      logger.error("Failed to fetch attendances for aggregation period", error);
      setPeriodAttendances([]);
    } finally {
      setIsLoadingPeriodAttendances(false);
    }
  }, [aggregationEndDate, aggregationStartDate]);

  const fetchTodayDailyReportStatus = useCallback(async () => {
    setIsLoadingDailyReportStatus(true);

    try {
      let nextToken: string | null = null;
      const submittedStaffIds = new Set<string>();
      const approvedStaffIds = new Set<string>();

      do {
        const response = (await graphqlClient.graphql({
          query: listDailyReports,
          variables: {
            limit: 200,
            filter: {
              reportDate: {
                eq: targetWorkDate,
              },
            },
            nextToken,
          },
          authMode: "userPool",
        })) as GraphQLResult<ListDailyReportsQuery>;

        if (response.errors?.length) {
          throw new Error(response.errors[0].message);
        }

        const connection = response.data?.listDailyReports;
        const items = connection?.items ?? [];

        items.forEach((dailyReport) => {
          if (!dailyReport?.staffId) {
            return;
          }

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
      setIsLoadingDailyReportStatus(false);
    }
  }, [targetWorkDate]);

  useEffect(() => {
    void fetchCurrentWorkingStaffCount();
  }, [fetchCurrentWorkingStaffCount]);

  useEffect(() => {
    if (closeDatesLoading) {
      return;
    }
    void fetchPeriodAttendances();
  }, [closeDatesLoading, fetchPeriodAttendances]);

  useEffect(() => {
    void fetchTodayDailyReportStatus();
  }, [fetchTodayDailyReportStatus]);

  const currentWorkingStaffCountLabel = isLoadingCurrentWorkingStaffCount
    ? "集計中"
    : `${currentWorkingStaffCount}人`;
  const submittedDailyReportCountLabel = isLoadingDailyReportStatus
    ? "集計中"
    : `${submittedDailyReportCount}件`;
  const approvedDailyReportCountLabel = isLoadingDailyReportStatus
    ? "集計中"
    : `${approvedDailyReportCount}件`;
  const currentWorkingStaffInfoLabel = `${targetWorkDate} 時点の勤務中・休憩中スタッフ数`;
  const aggregationPeriodInfoLabel = `集計期間: ${dayjs(aggregationStartDate).format("M/D")}〜${dayjs(aggregationEndDate).format("M/D")}`;

  const staffWorkStatusSummary = useMemo(() => {
    const standardWorkHours = Math.max(getStandardWorkHours(), 0);
    const { staffLabelsByCanonicalId, staffAliasToCanonicalId } = staffs.reduce<{
      staffLabelsByCanonicalId: Record<string, string>;
      staffAliasToCanonicalId: Record<string, string>;
    }>(
      (acc, staff) => {
        if (!staff.id) {
          return acc;
        }
        const displayName = [staff.familyName, staff.givenName]
          .filter((part): part is string => Boolean(part && part.trim()))
          .join(" ");
        if (!displayName) {
          return acc;
        }
        acc.staffLabelsByCanonicalId[staff.id] = displayName;
        acc.staffAliasToCanonicalId[staff.id] = staff.id;
        if (staff.cognitoUserId) {
          acc.staffAliasToCanonicalId[staff.cognitoUserId] = staff.id;
        }
        return acc;
      },
      {
        staffLabelsByCanonicalId: {},
        staffAliasToCanonicalId: {},
      },
    );
    const staffIds = Object.keys(staffLabelsByCanonicalId);
    const totalsByStaff = periodAttendances.reduce<
      Record<string, { workHours: number; overtimeHours: number }>
    >(
      (acc, attendance) => {
        if (!attendance.staffId || !attendance.startTime || !attendance.endTime) {
          return acc;
        }
        const canonicalStaffId = staffAliasToCanonicalId[attendance.staffId];
        if (!canonicalStaffId) {
          return acc;
        }

        const workHours = calcTotalWorkTime(attendance.startTime, attendance.endTime);
        if (!Number.isFinite(workHours)) {
          return acc;
        }

        const restHours = (attendance.rests ?? [])
          .filter((item): item is NonNullable<typeof item> => !!item)
          .reduce((restAcc, rest) => {
            if (!rest.startTime || !rest.endTime) {
              return restAcc;
            }
            return restAcc + calcTotalRestTime(rest.startTime, rest.endTime);
          }, 0);
        if (!Number.isFinite(restHours)) {
          return acc;
        }

        const netWorkHours = Math.max(workHours - restHours, 0);
        if (!Number.isFinite(netWorkHours)) {
          return acc;
        }

        const current = acc[canonicalStaffId] ?? {
          workHours: 0,
          overtimeHours: 0,
        };
        const dailyOvertimeHours = Math.max(netWorkHours - standardWorkHours, 0);
        acc[canonicalStaffId] = {
          workHours: Number((current.workHours + netWorkHours).toFixed(2)),
          overtimeHours: Number(
            (current.overtimeHours + dailyOvertimeHours).toFixed(2),
          ),
        };
        return acc;
      },
      {},
    );

    // 集計期間中に勤怠データがないスタッフも 0 時間として表示対象に含める
    staffIds.forEach((staffId) => {
      if (totalsByStaff[staffId]) {
        return;
      }
      totalsByStaff[staffId] = {
        workHours: 0,
        overtimeHours: 0,
      };
    });

    return Object.entries(totalsByStaff)
      .map(([staffId, totals]) => {
        const label = staffLabelsByCanonicalId[staffId];
        if (!label) {
          return null;
        }
        return {
          label,
          workHours: totals.workHours,
          overtimeHours: totals.overtimeHours,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .toSorted((left, right) => right.workHours - left.workHours);
  }, [getStandardWorkHours, periodAttendances, staffs]);

  const staffWorkStatusChartData = useMemo(
    () => ({
      labels: staffWorkStatusSummary.map((item) => item.label),
      datasets: [
        {
          label: "勤務時間",
          data: staffWorkStatusSummary.map((item) => item.workHours),
          backgroundColor: "rgba(14,116,144,0.82)",
          borderColor: "rgba(14,116,144,1)",
          borderWidth: 1,
          stack: "work-status",
        },
        {
          label: "残業時間",
          data: staffWorkStatusSummary.map((item) => -item.overtimeHours),
          backgroundColor: "rgba(225,29,72,0.82)",
          borderColor: "rgba(225,29,72,1)",
          borderWidth: 1,
          stack: "work-status",
        },
      ],
    }),
    [staffWorkStatusSummary],
  );

  const staffWorkStatusChartOptions = useMemo<ChartOptions<"bar">>(() => {
    const maxWorkHours = Math.max(0, ...staffWorkStatusSummary.map((item) => item.workHours));
    const maxOvertimeHours = Math.max(
      0,
      ...staffWorkStatusSummary.map((item) => item.overtimeHours),
    );

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 12,
            boxHeight: 12,
            color: "#334155",
          },
        },
        tooltip: {
          callbacks: {
            label: (context) =>
              `${context.dataset.label}: ${Math.abs(Number(context.parsed.y ?? 0)).toFixed(1)}h`,
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: {
            display: false,
          },
          ticks: {
            color: "#64748b",
            autoSkip: false,
            maxRotation: 90,
            minRotation: 90,
          },
        },
        y: {
          stacked: true,
          suggestedMin:
            maxOvertimeHours > 0 ? -Math.ceil(maxOvertimeHours + 0.5) : 0,
          suggestedMax: Math.max(1, Math.ceil(maxWorkHours + 0.5)),
          ticks: {
            color: "#64748b",
            callback: (value) => `${value}h`,
          },
          grid: {
            color: "rgba(148,163,184,0.22)",
          },
        },
      },
    };
  }, [staffWorkStatusSummary]);

  return (
    <Stack
      component="section"
      sx={{
        flex: 1,
        width: "100%",
        boxSizing: "border-box",
        px: PAGE_PADDING_X,
        py: PAGE_PADDING_Y,
        gap: PAGE_SECTION_GAP,
      }}
    >
      <PageSection
        variant="plain"
        layoutVariant="dashboard"
      >
        <div
          data-testid="admin-dashboard-count-cards-grid"
          className="grid grid-cols-1 gap-3 lg:grid-cols-4"
        >
          <Stack
            data-testid="admin-dashboard-current-working-staff-card"
            sx={{
              borderRadius: "18px",
              border: "1.5px solid rgba(148,163,184,0.42)",
              bgcolor: "#ffffff",
              px: { xs: 1.5, md: 2 },
              py: { xs: 1.5, md: 1.25 },
              minHeight: { lg: "140px" },
              boxShadow: "0 14px 28px -24px rgba(15,23,42,0.45)",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <Typography
                component="h2"
                sx={{
                  m: 0,
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                スタッフの勤務状況
              </Typography>
              <Tooltip title={currentWorkingStaffInfoLabel} arrow>
                <button
                  type="button"
                  data-testid="admin-dashboard-current-working-staff-info"
                  aria-label={currentWorkingStaffInfoLabel}
                  className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] font-semibold leading-none text-slate-600"
                >
                  i
                </button>
              </Tooltip>
            </div>
            <Typography
              data-testid="admin-dashboard-current-working-staff-count"
              sx={{
                mt: 1,
                m: 0,
                fontSize: { xs: "2rem", md: "2.25rem" },
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "#0f172a",
              }}
            >
              {currentWorkingStaffCountLabel}
            </Typography>
          </Stack>

          <Stack
            data-testid="admin-dashboard-daily-report-status-card"
            sx={{
              borderRadius: "18px",
              border: "1.5px solid rgba(148,163,184,0.42)",
              bgcolor: "#ffffff",
              px: { xs: 1.5, md: 2 },
              py: { xs: 1.5, md: 1.25 },
              minHeight: { lg: "140px" },
              boxShadow: "0 14px 28px -24px rgba(15,23,42,0.45)",
            }}
          >
            <Typography
              component="h2"
              sx={{
                m: 0,
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              今日の日報提出状況
            </Typography>
            <Typography
              data-testid="admin-dashboard-daily-report-submitted-count"
              sx={{
                mt: 1,
                m: 0,
                fontSize: { xs: "2rem", md: "2.25rem" },
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "#0f172a",
              }}
            >
              {submittedDailyReportCountLabel}
              {!isLoadingDailyReportStatus ? (
                <span
                  data-testid="admin-dashboard-daily-report-approved-count"
                  className="ml-1 text-sm font-semibold tracking-normal text-slate-500 md:text-base"
                >
                  (確認済み {approvedDailyReportCountLabel})
                </span>
              ) : null}
            </Typography>
          </Stack>

          <AdminPendingApprovalSummary
            layoutMode="inline-cards"
            showAdminOnlyTag={false}
          />

          <Stack
            data-testid="admin-dashboard-staff-work-status-chart-card"
            className="h-full lg:col-span-4"
            sx={{
              borderRadius: "18px",
              border: "1.5px solid rgba(148,163,184,0.42)",
              bgcolor: "#ffffff",
              px: { xs: 1.5, md: 2 },
              py: { xs: 1.5, md: 1.75 },
              boxShadow: "0 14px 28px -24px rgba(15,23,42,0.45)",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <Typography
                component="h2"
                sx={{
                  m: 0,
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                スタッフごとの勤務状況
              </Typography>
              <Tooltip title={aggregationPeriodInfoLabel} arrow>
                <button
                  type="button"
                  data-testid="admin-dashboard-staff-work-status-info"
                  aria-label={aggregationPeriodInfoLabel}
                  className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] font-semibold leading-none text-slate-600"
                >
                  i
                </button>
              </Tooltip>
            </div>
            <div className="mt-1 h-72">
              {isLoadingPeriodAttendances || staffLoading || closeDatesLoading ? (
                <div className="flex h-full items-center justify-center text-xs font-medium text-slate-500">
                  集計中
                </div>
              ) : staffWorkStatusSummary.length > 0 ? (
                <Bar
                  data={staffWorkStatusChartData}
                  options={staffWorkStatusChartOptions}
                  data-testid="admin-dashboard-staff-work-status-chart"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs font-medium text-slate-500">
                  表示可能な勤務データがありません
                </div>
              )}
            </div>
          </Stack>
        </div>
      </PageSection>
    </Stack>
  );
}
