import { useListAttendancesByDateRangeQuery } from "@entities/attendance/api/attendanceApi";
import useCloseDates from "@entities/attendance/model/useCloseDates";
import {
  Button,
  ButtonGroup,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Attendance, CloseDate } from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { useContext, useMemo, useState } from "react";

import { AuthContext } from "@/context/AuthContext";
import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";
import { calcTotalRestTime , calcTotalWorkTime } from "@/entities/attendance/lib/time";

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <Stack
      spacing={0.5}
      sx={{
        minWidth: 140,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.25,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6">{value}</Typography>
    </Stack>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}

type MonthlyStat = {
  workHours: number;
  paidDays: number;
  specialHolidayDays: number;
  absentDays: number;
  workDays: number;
};

type MonthlyTerm = {
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
  closeMonth: dayjs.Dayjs;
  source: "closeDate" | "fallback";
};

function buildMonthlyTerms(
  year: number,
  closeDates: CloseDate[]
): MonthlyTerm[] {
  const fallback = Array.from({ length: 12 }, (_, index): MonthlyTerm => {
    const closeMonth = dayjs().year(year).month(index).startOf("month");
    return {
      start: closeMonth.startOf("month"),
      end: closeMonth.endOf("month"),
      closeMonth,
      source: "fallback",
    };
  });

  const latestByMonth: Array<{ item: CloseDate; updatedAt: number } | null> =
    Array.from({ length: 12 }, () => null);

  closeDates.forEach((item) => {
    const close = dayjs(item.closeDate);
    if (!close.isValid() || close.year() !== year) return;

    const monthIndex = close.month();
    const updatedAt = dayjs(item.updatedAt ?? item.closeDate).valueOf();
    const existing = latestByMonth[monthIndex];

    if (!existing || updatedAt > existing.updatedAt) {
      latestByMonth[monthIndex] = { item, updatedAt };
    }
  });

  latestByMonth.forEach((payload, index) => {
    if (!payload) return;

    const { item } = payload;
    const start = dayjs(item.startDate).startOf("day");
    const end = dayjs(item.endDate).startOf("day");
    if (!start.isValid() || !end.isValid()) return;

    fallback[index] = {
      start,
      end,
      closeMonth: dayjs(item.closeDate).startOf("month"),
      source: "closeDate",
    };
  });

  return fallback;
}

function buildMonthlyStats(
  attendances: Attendance[],
  monthlyTerms: MonthlyTerm[]
): MonthlyStat[] {
  const monthly: MonthlyStat[] = monthlyTerms.map(
    (): MonthlyStat => ({
      workHours: 0,
      paidDays: 0,
      specialHolidayDays: 0,
      absentDays: 0,
      workDays: 0,
    })
  );

  attendances.forEach((attendance) => {
    const workDate = dayjs(attendance.workDate).startOf("day");
    if (!workDate.isValid()) return;

    const monthIndex = monthlyTerms.findIndex(
      (term) =>
        !workDate.isBefore(term.start, "day") &&
        !workDate.isAfter(term.end, "day")
    );

    const targetIndex = monthIndex === -1 ? workDate.month() : monthIndex;
    const stat = monthly[targetIndex];
    if (!stat) return;

    if (attendance.paidHolidayFlag) {
      stat.paidDays += 1;
    }

    if (attendance.specialHolidayFlag) {
      stat.specialHolidayDays += 1;
    }

    if (attendance.absentFlag) {
      stat.absentDays += 1;
    }

    if (attendance.startTime && attendance.endTime) {
      const gross = calcTotalWorkTime(attendance.startTime, attendance.endTime);
      const totalRest = (attendance.rests ?? [])
        .filter((item): item is NonNullable<typeof item> => !!item)
        .reduce((sum, rest) => {
          if (!rest.startTime || !rest.endTime) return sum;
          return sum + calcTotalRestTime(rest.startTime, rest.endTime);
        }, 0);

      const net = Math.max(gross - totalRest, 0);
      stat.workHours = Number((stat.workHours + net).toFixed(1));
      stat.workDays += 1;
    }
  });

  return monthly;
}

function formatRangeLabel(start: dayjs.Dayjs, end: dayjs.Dayjs) {
  return `${start.format("YYYY/MM/DD")} - ${end.format("YYYY/MM/DD")}`;
}

export default function AttendanceStatistics() {
  const { cognitoUser } = useContext(AuthContext);
  const {
    closeDates,
    loading: closeDatesLoading,
    error: closeDatesError,
  } = useCloseDates();
  const [year, setYear] = useState<number>(dayjs().year());

  const monthlyTerms = useMemo(
    () => buildMonthlyTerms(year, closeDates),
    [closeDates, year]
  );

  const { rangeStart, rangeEnd } = useMemo(() => {
    if (monthlyTerms.length === 0) {
      const start = dayjs().year(year).startOf("year");
      const end = dayjs().year(year).endOf("year");
      return { rangeStart: start, rangeEnd: end };
    }

    const start = monthlyTerms
      .map((term) => term.start)
      .reduce((earliest, current) =>
        current.isBefore(earliest) ? current : earliest
      );

    const end = monthlyTerms
      .map((term) => term.end)
      .reduce((latest, current) =>
        current.isAfter(latest) ? current : latest
      );

    return { rangeStart: start, rangeEnd: end };
  }, [monthlyTerms, year]);

  const startDate = useMemo(
    () => rangeStart.format(AttendanceDate.DataFormat),
    [rangeStart]
  );
  const endDate = useMemo(
    () => rangeEnd.format(AttendanceDate.DataFormat),
    [rangeEnd]
  );

  const closeDatesStatusKnown =
    closeDatesLoading || closeDatesError !== null || closeDates.length > 0;

  const skipAttendanceFetch =
    !closeDatesStatusKnown || closeDatesLoading || !cognitoUser?.id;

  const shouldFetch = Boolean(cognitoUser?.id);
  const {
    data: attendances = [],
    isLoading,
    isFetching,
    error,
    isError,
  } = useListAttendancesByDateRangeQuery(
    {
      staffId: cognitoUser?.id ?? "",
      startDate,
      endDate,
    },
    { skip: skipAttendanceFetch }
  );

  const monthlyStats = useMemo(
    () => buildMonthlyStats(attendances, monthlyTerms),
    [attendances, monthlyTerms]
  );

  const monthSummaries = useMemo(
    () =>
      monthlyTerms.map((term, index) => ({
        label: `${index + 1}月`,
        rangeText: `${term.start.format(
          AttendanceDate.DisplayFormat
        )} 〜 ${term.end.format(AttendanceDate.DisplayFormat)}`,
        isFallback: term.source === "fallback",
      })),
    [monthlyTerms]
  );
  const totalHours = useMemo(
    () => monthlyStats.reduce((sum, value) => sum + value.workHours, 0),
    [monthlyStats]
  );
  const totalPaidDays = useMemo(
    () => monthlyStats.reduce((sum, value) => sum + value.paidDays, 0),
    [monthlyStats]
  );
  const totalSpecialHolidayDays = useMemo(
    () =>
      monthlyStats.reduce((sum, value) => sum + value.specialHolidayDays, 0),
    [monthlyStats]
  );
  const totalAbsentDays = useMemo(
    () => monthlyStats.reduce((sum, value) => sum + value.absentDays, 0),
    [monthlyStats]
  );
  const totalWorkDays = useMemo(
    () => monthlyStats.reduce((sum, value) => sum + value.workDays, 0),
    [monthlyStats]
  );
  const loading =
    isLoading || isFetching || closeDatesLoading || !closeDatesStatusKnown;

  const hasFallbackTerms = useMemo(
    () => monthlyTerms.some((term) => term.source === "fallback"),
    [monthlyTerms]
  );

  const errorMessage = isError
    ? typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message?: unknown }).message === "string"
      ? (error as { message: string }).message
      : "稼働統計の取得に失敗しました"
    : "";

  if (!shouldFetch) {
    return (
      <Typography color="text.secondary">
        ログインユーザーの情報が取得できませんでした。
      </Typography>
    );
  }

  return (
    <Stack spacing={2} sx={{ height: 1 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
      >
        <Stack spacing={0.5}>
          <Typography variant="h1">稼働統計</Typography>
          <Typography variant="body2" color="text.secondary">
            {formatRangeLabel(rangeStart, rangeEnd)}{" "}
            を集計期間として月別に集計しています。
          </Typography>
          {hasFallbackTerms && (
            <Typography variant="body2" color="text.secondary">
              集計対象月が未登録の期間は、暫定で月初〜月末を集計期間として使用しています。
            </Typography>
          )}
          {closeDatesError && (
            <Typography variant="body2" color="error">
              集計対象月の取得に失敗したため、暫定の集計期間で表示しています。
            </Typography>
          )}
        </Stack>
        <ButtonGroup variant="outlined" size="small">
          <Button onClick={() => setYear((prev) => prev - 1)}>前年</Button>
          <Button disabled>{year}年</Button>
          <Button onClick={() => setYear((prev) => prev + 1)}>翌年</Button>
        </ButtonGroup>
      </Stack>

      {loading && <LinearProgress aria-label="稼働統計を読み込み中" />}
      {isError && (
        <Typography color="error" variant="body2">
          {errorMessage}
        </Typography>
      )}

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: { xs: 2, sm: 3 },
        }}
      >
        <Stack spacing={1.5}>
          <Typography variant="subtitle1">年間サマリー</Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            useFlexGap
            flexWrap="wrap"
          >
            <StatItem label="稼働日数" value={`${totalWorkDays} 日`} />
            <StatItem
              label="稼働時間"
              value={`${totalHours.toFixed(1)} 時間`}
            />
            <StatItem label="有給取得" value={`${totalPaidDays} 日`} />
            <StatItem
              label="特別休暇"
              value={`${totalSpecialHolidayDays} 日`}
            />
            <StatItem label="欠勤" value={`${totalAbsentDays} 日`} />
          </Stack>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: { xs: 2, sm: 3 },
        }}
      >
        <Stack spacing={1.5}>
          <Typography variant="subtitle1">月別サマリー</Typography>
          <Stack spacing={1}>
            {monthSummaries.map(({ label, rangeText, isFallback }, index) => {
              const stat = monthlyStats[index];
              return (
                <Stack
                  key={label}
                  spacing={0.75}
                  sx={{
                    borderBottom: "1px dashed",
                    borderColor: "divider",
                    pb: 1,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between">
                    <Stack spacing={0.25}>
                      <Typography variant="body2" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {rangeText}
                        {isFallback ? "（暫定）" : ""}
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {stat.workHours.toFixed(1)} 時間
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <MiniStat label="稼働日" value={`${stat.workDays} 日`} />
                    <MiniStat label="有給" value={`${stat.paidDays} 日`} />
                    <MiniStat
                      label="特別休暇"
                      value={`${stat.specialHolidayDays} 日`}
                    />
                    <MiniStat label="欠勤" value={`${stat.absentDays} 日`} />
                  </Stack>
                </Stack>
              );
            })}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body1">年間合計</Typography>
              <Typography variant="h6">{totalHours.toFixed(1)} 時間</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
