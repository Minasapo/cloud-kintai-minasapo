import { Box, CircularProgress, Paper } from "@mui/material";
import { Attendance } from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { lazy, Suspense, useContext, useMemo } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { calcTotalRestTime } from "@/pages/attendance/edit/DesktopEditor/RestTimeItem/RestTimeInput/RestTimeInput";
import { calcTotalWorkTime } from "@/pages/attendance/edit/DesktopEditor/WorkTimeInput/WorkTimeInput";

const LazyBarChart = lazy(async () => {
  const module = await import("@mui/x-charts/BarChart");
  return { default: module.BarChart };
});

export function AttendanceGraph({
  attendances,
}: {
  attendances: Attendance[];
}) {
  const {
    getStartTime,
    getEndTime,
    getLunchRestStartTime,
    getLunchRestEndTime,
  } = useContext(AppConfigContext);

  const standardWorkHours = useMemo(() => {
    const start = getStartTime();
    const end = getEndTime();
    const lunchStart = getLunchRestStartTime();
    const lunchEnd = getLunchRestEndTime();

    const baseHours = end.diff(start, "hour", true);
    const lunchHours = Math.max(lunchEnd.diff(lunchStart, "hour", true), 0);
    return Math.max(baseHours - lunchHours, 0);
  }, [getStartTime, getEndTime, getLunchRestStartTime, getLunchRestEndTime]);

  const { workTimeData, restTimeData, overtimeData } = attendances.reduce(
    (acc, attendance) => {
      if (!attendance.startTime || !attendance.endTime) {
        acc.workTimeData.push(0);
        acc.restTimeData.push(0);
        acc.overtimeData.push(0);
        return acc;
      }

      const grossWork = calcTotalWorkTime(
        attendance.startTime,
        attendance.endTime
      );

      const totalRest = (attendance.rests ?? [])
        .filter((item): item is NonNullable<typeof item> => !!item)
        .reduce((sum, rest) => {
          if (!rest.startTime || !rest.endTime) return sum;
          return sum + calcTotalRestTime(rest.startTime, rest.endTime);
        }, 0);

      const netWork = Math.max(grossWork - totalRest, 0);
      const overtime = Math.max(netWork - standardWorkHours, 0);
      const regularWork = Math.max(netWork - overtime, 0);

      acc.workTimeData.push(regularWork);
      acc.restTimeData.push(totalRest);
      acc.overtimeData.push(overtime);

      return acc;
    },
    {
      workTimeData: [] as number[],
      restTimeData: [] as number[],
      overtimeData: [] as number[],
    }
  );

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
        data: [
          ...attendances.map((attendance) =>
            dayjs(attendance.workDate).format("M/D")
          ),
        ],
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
