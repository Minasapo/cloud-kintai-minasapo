import { Paper } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { Attendance } from "@shared/api/graphql/types";
import dayjs from "dayjs";

import { calcTotalRestTime } from "@/pages/attendance/edit/DesktopEditor/RestTimeItem/RestTimeInput/RestTimeInput";
import { calcTotalWorkTime } from "@/pages/attendance/edit/DesktopEditor/WorkTimeInput/WorkTimeInput";

export function AttendanceGraph({
  attendances,
}: {
  attendances: Attendance[];
}) {
  const workTimeData = attendances.map((attendance) => {
    if (!attendance.startTime || !attendance.endTime) return 0;

    const workTime = calcTotalWorkTime(
      attendance.startTime,
      attendance.endTime
    );
    return workTime;
  });

  const restTimeData = attendances.map((attendance) => {
    if (!attendance.rests) return 0;

    const restTime = attendance.rests
      .filter((item): item is NonNullable<typeof item> => !!item)
      .reduce((acc, rest) => {
        if (!rest.startTime || !rest.endTime) return acc;

        return acc + calcTotalRestTime(rest.startTime, rest.endTime);
      }, 0);

    return restTime;
  });

  const seriesA = {
    data: workTimeData,
    label: "勤務時間",
  };
  const seriesB = {
    data: restTimeData,
    label: "休憩時間",
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
      <BarChart
        height={150}
        grid={{ horizontal: true }}
        series={[
          { ...seriesA, stack: "time" },
          { ...seriesB, stack: "time" },
        ]}
        {...props}
      />
    </Paper>
  );
}
