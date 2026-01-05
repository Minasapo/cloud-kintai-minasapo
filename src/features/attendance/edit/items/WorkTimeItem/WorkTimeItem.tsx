import { Box, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useContext, useEffect, useMemo, useState } from "react";

import { AttendanceEditContext } from "@/pages/attendance/edit/AttendanceEditProvider";

import EndTimeInput from "./EndTimeInput";
import StartTimeInput from "./StartTimeInput";

export function calcTotalWorkTime(
  startTime: string | null | undefined,
  endTime: string | null | undefined
) {
  if (!startTime || !endTime) return 0;

  const diff = dayjs(endTime).diff(dayjs(startTime), "hour", true);
  return diff;
}

interface WorkTimeItemProps {
  highlightStartTime?: boolean;
  highlightEndTime?: boolean;
}

export function WorkTimeItem({
  highlightStartTime = false,
  highlightEndTime = false,
}: WorkTimeItemProps) {
  const { workDate, control, watch, setValue, getValues } = useContext(
    AttendanceEditContext
  );
  const [totalWorkTime, setTotalWorkTime] = useState<number>(0);

  const memoizedCalcTotalWorkTime = useMemo(() => calcTotalWorkTime, []);

  useEffect(() => {
    if (!watch) return;

    const unsubscribe = watch((data) => {
      const diff = memoizedCalcTotalWorkTime(data.startTime, data.endTime);
      setTotalWorkTime(diff);
    });
    return typeof unsubscribe === "function" ? unsubscribe : undefined;
  }, [watch, memoizedCalcTotalWorkTime]);

  if (!workDate || !control || !setValue || !getValues || !watch) {
    return null;
  }

  return (
    <Stack direction="row" alignItems={"top"} sx={{ boxSizing: "border-box" }}>
      <Box sx={{ fontWeight: "bold", width: "150px" }}>勤務時間</Box>
      <Box sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={2} alignItems={"center"}>
          <Box>
            <Stack direction="row" spacing={1}>
              <Box>
                <StartTimeInput highlight={highlightStartTime} />
              </Box>
              <Box>
                <Typography variant="body1" sx={{ py: 1 }}>
                  ～
                </Typography>
              </Box>
              <Box>
                <EndTimeInput highlight={highlightEndTime} />
              </Box>
            </Stack>
          </Box>
          <Box sx={{ flexGrow: 1 }} textAlign={"right"}>
            <Typography variant="body1">
              {totalWorkTime.toFixed(1)}時間
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
