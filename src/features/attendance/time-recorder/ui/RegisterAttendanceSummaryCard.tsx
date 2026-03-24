import { useListAttendancesByDateRangeQuery } from "@entities/attendance/api/attendanceApi";
import { AttendanceDate } from "@entities/attendance/lib/AttendanceDate";
import { calcTotalRestTime, calcTotalWorkTime } from "@entities/attendance/lib/time";
import useCloseDates from "@entities/attendance/model/useCloseDates";
import { Tooltip as MuiTooltip } from "@mui/material";
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
import { useContext, useMemo } from "react";
import { Bar } from "react-chartjs-2";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AuthContext } from "@/context/AuthContext";

type DateRange = {
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
};

const getEffectiveDateRange = (
  month: dayjs.Dayjs,
  closeDates: Array<{
    startDate?: string | null;
    endDate?: string | null;
    updatedAt?: string | null;
    closeDate?: string | null;
  }>,
): DateRange => {
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
    const containsToday = applicableCloseDates.find((cd) => {
      const start = dayjs(cd.startDate);
      const end = dayjs(cd.endDate);
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

type RegisterAttendanceSummaryCardProps = {
  attendanceErrorCount?: number;
};

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTooltip, Legend);

export default function RegisterAttendanceSummaryCard({
  attendanceErrorCount = 0,
}: RegisterAttendanceSummaryCardProps) {
  const { cognitoUser } = useContext(AuthContext);
  const { getStandardWorkHours } = useContext(AppConfigContext);
  const { closeDates, loading: closeDatesLoading, error: closeDatesError } =
    useCloseDates();

  const currentMonth = useMemo(() => dayjs().startOf("month"), []);
  const effectiveDateRange = useMemo(
    () => getEffectiveDateRange(currentMonth, closeDates),
    [closeDates, currentMonth],
  );

  const queryDateRange = useMemo(() => {
    const monthStart = currentMonth.startOf("month");
    const monthEnd = currentMonth.endOf("month");

    return {
      start: effectiveDateRange.start.isBefore(monthStart, "day")
        ? effectiveDateRange.start
        : monthStart,
      end: effectiveDateRange.end.isAfter(monthEnd, "day")
        ? effectiveDateRange.end
        : monthEnd,
    };
  }, [currentMonth, effectiveDateRange]);

  const startDate = queryDateRange.start.format(AttendanceDate.DataFormat);
  const endDate = queryDateRange.end.format(AttendanceDate.DataFormat);

  const {
    data: attendances = [],
    isLoading: attendanceLoading,
    isFetching: attendanceFetching,
    isUninitialized: attendanceUninitialized,
    error: attendancesError,
  } = useListAttendancesByDateRangeQuery(
    {
      staffId: cognitoUser?.id ?? "",
      startDate,
      endDate,
    },
    {
      skip: !cognitoUser?.id,
      refetchOnMountOrArgChange: true,
    },
  );

  const filteredAttendances = useMemo(
    () =>
      attendances.filter((attendance) => {
        if (!attendance.workDate) {
          return false;
        }
        const workDate = dayjs(attendance.workDate);
        return (
          !workDate.isBefore(effectiveDateRange.start, "day") &&
          !workDate.isAfter(effectiveDateRange.end, "day")
        );
      }),
    [attendances, effectiveDateRange],
  );

  const summary = useMemo(() => {
    const totalWorkTime = filteredAttendances.reduce((acc, attendance) => {
      if (!attendance.startTime || !attendance.endTime) {
        return acc;
      }
      return acc + calcTotalWorkTime(attendance.startTime, attendance.endTime);
    }, 0);

    const totalRestTime = filteredAttendances.reduce((acc, attendance) => {
      if (!attendance.rests) {
        return acc;
      }

      const restTime = attendance.rests
        .filter((item): item is NonNullable<typeof item> => !!item)
        .reduce((restAcc, rest) => {
          if (!rest.startTime || !rest.endTime) {
            return restAcc;
          }
          return restAcc + calcTotalRestTime(rest.startTime, rest.endTime);
        }, 0);

      return acc + restTime;
    }, 0);

    return {
      totalHours: totalWorkTime - totalRestTime,
      workDays: filteredAttendances.length,
    };
  }, [filteredAttendances]);

  const chartSummary = useMemo(() => {
    const standardWorkHours = Math.max(getStandardWorkHours(), 0);
    const netWorkHoursByDate = filteredAttendances.reduce<Record<string, number>>(
      (acc, attendance) => {
        if (!attendance.workDate || !attendance.startTime || !attendance.endTime) {
          return acc;
        }
        const totalWorkHours = calcTotalWorkTime(
          attendance.startTime,
          attendance.endTime,
        );
        const totalRestHours = (attendance.rests ?? [])
          .filter((item): item is NonNullable<typeof item> => !!item)
          .reduce((restAcc, rest) => {
            if (!rest.startTime || !rest.endTime) {
              return restAcc;
            }
            return restAcc + calcTotalRestTime(rest.startTime, rest.endTime);
          }, 0);
        const netWorkHours = Math.max(totalWorkHours - totalRestHours, 0);
        const workDateKey = dayjs(attendance.workDate).format(
          AttendanceDate.DataFormat,
        );
        acc[workDateKey] = (acc[workDateKey] ?? 0) + netWorkHours;
        return acc;
      },
      {},
    );

    const periodDays = [];
    let cursor = effectiveDateRange.start.startOf("day");
    const periodEnd = effectiveDateRange.end.startOf("day");
    while (!cursor.isAfter(periodEnd, "day")) {
      periodDays.push(cursor);
      cursor = cursor.add(1, "day");
    }

    return periodDays.map((workDate) => {
      const workDateKey = workDate.format(AttendanceDate.DataFormat);
      const netWorkHours = Number((netWorkHoursByDate[workDateKey] ?? 0).toFixed(2));
      const overtimeHours = Number(
        Math.max(netWorkHours - standardWorkHours, 0).toFixed(2),
      );

      return {
        label: workDate.format("M/D"),
        workHours: netWorkHours,
        overtimeHours,
        workDateValue: workDate.valueOf(),
      };
    });
  }, [effectiveDateRange, filteredAttendances, getStandardWorkHours]);

  const stackedBarData = useMemo(
    () => ({
      labels: chartSummary.map((item) => item.label),
      datasets: [
        {
          label: "勤務時間",
          data: chartSummary.map((item) => item.workHours),
          backgroundColor: "rgba(14,116,144,0.8)",
          borderColor: "rgba(14,116,144,1)",
          borderWidth: 1,
          stack: "work-status",
        },
        {
          label: "残業時間",
          data: chartSummary.map((item) => -item.overtimeHours),
          backgroundColor: "rgba(225,29,72,0.82)",
          borderColor: "rgba(225,29,72,1)",
          borderWidth: 1,
          stack: "work-status",
        },
      ],
    }),
    [chartSummary],
  );

  const stackedBarOptions = useMemo<ChartOptions<"bar">>(() => {
    const maxWork = Math.max(0, ...chartSummary.map((item) => item.workHours));
    const maxOvertime = Math.max(
      0,
      ...chartSummary.map((item) => item.overtimeHours),
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
            maxRotation: 0,
          },
        },
        y: {
          stacked: true,
          suggestedMin: maxOvertime > 0 ? -Math.ceil(maxOvertime + 0.5) : 0,
          suggestedMax: Math.max(1, Math.ceil(maxWork + 0.5)),
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
  }, [chartSummary]);

  const isLoading =
    closeDatesLoading || attendanceLoading || attendanceFetching || attendanceUninitialized;
  const hasError = Boolean(closeDatesError || attendancesError);

  const rangeLabel = `${effectiveDateRange.start.format("M/D")}〜${effectiveDateRange.end.format("M/D")}`;

  const totalHoursLabel =
    hasError || isLoading ? "--" : `${summary.totalHours.toFixed(1)}h`;
  const workDaysLabel = hasError || isLoading ? "--" : `${summary.workDays}日`;
  const attendanceErrorLabel = `${attendanceErrorCount}件`;
  const workStatusDataCount = filteredAttendances.filter(
    (attendance) => attendance.startTime && attendance.endTime,
  ).length;
  const hasAttendanceError = attendanceErrorCount > 0;

  return (
    <section
      data-testid="register-dashboard-attendance-summary-card"
      className="relative rounded-[1.35rem] border border-slate-200/80 bg-white p-4 shadow-[0_18px_32px_-28px_rgba(15,23,42,0.35)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="m-0 text-sm font-semibold tracking-[0.01em] text-slate-900">
            直近の勤務状況
          </h2>
        </div>
        <span className="absolute right-3 top-3 inline-flex">
          <MuiTooltip title={`集計期間について: ${rangeLabel}`} arrow>
            <button
              type="button"
              data-testid="register-dashboard-attendance-summary-info"
              aria-label={`集計期間について: ${rangeLabel}`}
              className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] font-semibold leading-none text-slate-600"
            >
              i
            </button>
          </MuiTooltip>
        </span>
        {isLoading && (
          <span className="inline-flex rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold leading-none text-slate-700">
            集計中
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 px-3.5 py-3">
          <p className="m-0 text-xs font-medium tracking-[0.03em] text-slate-500">
            合計勤務時間
          </p>
          <p className="m-0 mt-1.5 text-2xl font-extrabold leading-none tracking-[-0.03em] text-slate-950">
            {totalHoursLabel}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 px-3.5 py-3">
          <p className="m-0 text-xs font-medium tracking-[0.03em] text-slate-500">
            勤務日数
          </p>
          <p className="m-0 mt-1.5 text-2xl font-extrabold leading-none tracking-[-0.03em] text-slate-950">
            {workDaysLabel}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200/90 bg-slate-50/70 px-3.5 py-3">
        <p className="m-0 text-xs font-medium tracking-[0.03em] text-slate-500">
          打刻エラー件数
        </p>
        <p
          data-testid="register-dashboard-attendance-error-count"
          className={`m-0 mt-1.5 text-2xl font-extrabold leading-none tracking-[-0.03em] ${
            hasAttendanceError ? "text-rose-600" : "text-slate-950"
          }`}
        >
          {attendanceErrorLabel}
        </p>
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3.5">
        <div className="flex items-center justify-between gap-3">
          <p className="m-0 text-xs font-medium tracking-[0.03em] text-slate-500">
            勤務状況チャート
          </p>
          <p
            data-testid="register-dashboard-work-status-chart-count"
            className="m-0 text-xs font-semibold text-slate-600"
          >
            対象データ {workStatusDataCount}件
          </p>
        </div>
        <div className="mt-2 h-52">
          {chartSummary.length > 0 ? (
            <Bar
              data={stackedBarData}
              options={stackedBarOptions}
              data-testid="register-dashboard-work-status-chart"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs font-medium text-slate-500">
              表示可能な勤務データがありません
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
