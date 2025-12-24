import { useListAttendancesByDateRangeQuery } from "@entities/attendance/api/attendanceApi";
import {
  Button,
  ButtonGroup,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Attendance } from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { useContext, useMemo, useState } from "react";

import { AuthContext } from "@/context/AuthContext";
import { AttendanceDate } from "@/lib/AttendanceDate";
import { calcTotalRestTime } from "@/pages/attendance/edit/DesktopEditor/RestTimeItem/RestTimeInput/RestTimeInput";
import { calcTotalWorkTime } from "@/pages/attendance/edit/DesktopEditor/WorkTimeInput/WorkTimeInput";

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

function buildMonthlyStats(attendances: Attendance[]): MonthlyStat[] {
  const monthly: MonthlyStat[] = Array.from(
    { length: 12 },
    (): MonthlyStat => ({
      workHours: 0,
      paidDays: 0,
      specialHolidayDays: 0,
      absentDays: 0,
      workDays: 0,
    })
  );

  attendances.forEach((attendance) => {
    const monthIndex = dayjs(attendance.workDate).month();
    const stat = monthly[monthIndex];

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

function formatRangeLabel(year: number) {
  const start = dayjs().year(year).startOf("year").format("YYYY/MM/DD");
  const end = dayjs().year(year).endOf("year").format("YYYY/MM/DD");
  return `${start} - ${end}`;
}

export default function AttendanceStatistics() {
  const { cognitoUser } = useContext(AuthContext);
  const [year, setYear] = useState<number>(dayjs().year());

  const startDate = useMemo(
    () => dayjs().year(year).startOf("year").format(AttendanceDate.DataFormat),
    [year]
  );
  const endDate = useMemo(
    () => dayjs().year(year).endOf("year").format(AttendanceDate.DataFormat),
    [year]
  );

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
    { skip: !shouldFetch }
  );

  const monthlyStats = useMemo(
    () => buildMonthlyStats(attendances),
    [attendances]
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
  const loading = isLoading || isFetching;

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

  const monthLabels = Array.from(
    { length: 12 },
    (_, index) => `${index + 1}月`
  );

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
            {formatRangeLabel(year)} の稼働時間を月別に集計しています。
          </Typography>
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
            {monthLabels.map((label, index) => {
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
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
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
