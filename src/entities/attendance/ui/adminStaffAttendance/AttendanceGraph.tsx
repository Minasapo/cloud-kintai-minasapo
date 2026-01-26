import { Box, CircularProgress, Paper } from "@mui/material";
import { Attendance } from "@shared/api/graphql/types";
import dayjs, { Dayjs } from "dayjs";
import { lazy, Suspense, useContext, useMemo } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";
import { calcTotalRestTime , calcTotalWorkTime } from "@/entities/attendance/lib/time";

const LazyBarChart = lazy(async () => {
  const module = await import("@mui/x-charts/BarChart");
  return { default: module.BarChart };
});

export function AttendanceGraph({
  attendances,
  month,
}: {
  attendances: Attendance[];
  month?: Dayjs;
}) {
  const { getStandardWorkHours } = useContext(AppConfigContext);

  const standardWorkHours = useMemo(
    () => getStandardWorkHours(),
    [getStandardWorkHours]
  );

  const targetMonth = useMemo(
    () => (month ? month.startOf("month") : dayjs().startOf("month")),
    [month]
  );

  const attendanceByDate = useMemo(() => {
    return attendances.reduce((map, attendance) => {
      if (attendance.workDate) {
        const key = dayjs(attendance.workDate).format(
          AttendanceDate.DataFormat
        );
        map.set(key, attendance);
      }
      return map;
    }, new Map<string, Attendance>());
  }, [attendances]);

  const daysInMonth = useMemo(() => targetMonth.daysInMonth(), [targetMonth]);

  const { workTimeData, restTimeData, overtimeData, labels } = useMemo(() => {
    const workTime: number[] = [];
    const restTime: number[] = [];
    const overtime: number[] = [];
    const dateLabels: string[] = [];

    for (let i = 0; i < daysInMonth; i += 1) {
      const date = targetMonth.add(i, "day");
      const key = date.format(AttendanceDate.DataFormat);
      const attendance = attendanceByDate.get(key);

      const grossWork = attendance?.startTime
        ? calcTotalWorkTime(attendance.startTime, attendance.endTime)
        : 0;

      const totalRest = (attendance?.rests ?? [])
        .filter((item): item is NonNullable<typeof item> => !!item)
        .reduce((sum, rest) => {
          if (!rest.startTime || !rest.endTime) return sum;
          return sum + calcTotalRestTime(rest.startTime, rest.endTime);
        }, 0);

      const netWork = Math.max(grossWork - totalRest, 0);
      const overtimeHours = Math.max(netWork - standardWorkHours, 0);
      const regularWork = Math.max(netWork - overtimeHours, 0);

      workTime.push(regularWork);
      restTime.push(totalRest);
      overtime.push(overtimeHours);
      dateLabels.push(date.format("M/D"));
    }

    return {
      workTimeData: workTime,
      restTimeData: restTime,
      overtimeData: overtime,
      labels: dateLabels,
    };
  }, [attendanceByDate, daysInMonth, standardWorkHours, targetMonth]);

  const seriesA = {
    data: workTimeData,
    label: "勤務時間",
  };
  const seriesB = {
    data: restTimeData,
    label: "休憩時間",
  };
  const seriesC = {
    data: overtimeData,
    label: "残業時間",
  };

  const props = {
    xAxis: [
      {
        data: labels,
        scaleType: "band" as const,
      },
    ],
  };

  return (
    <Paper elevation={2}>
      <Suspense
        fallback={
          <Box sx={{ py: 3, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={24} aria-label="グラフを読み込み中" />
          </Box>
        }
      >
        <LazyBarChart
          height={150}
          grid={{ horizontal: true }}
          series={[
            { ...seriesA, stack: "time" },
            { ...seriesB, stack: "time" },
            { ...seriesC, stack: "time" },
          ]}
          {...props}
        />
      </Suspense>
    </Paper>
  );
}
