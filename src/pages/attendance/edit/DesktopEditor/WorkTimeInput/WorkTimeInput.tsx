import { Box, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";

import { AttendanceEditContext } from "../../AttendanceEditProvider";
import EndTimeInput from "./EndTimeInput";
import StartTimeInput from "./StartTimeInput";

export function calcTotalWorkTime(
  startTime: string | null | undefined,
  endTime: string | null | undefined
) {
  if (!startTime) return 0;

  const now = dayjs();
  const diff = dayjs(endTime || now).diff(dayjs(startTime), "hour", true);

  return diff;
}

interface WorkTimeInputProps {
  highlightStartTime?: boolean;
  highlightEndTime?: boolean;
}

export function WorkTimeInput({
  highlightStartTime = false,
  highlightEndTime = false,
}: WorkTimeInputProps) {
  const { workDate: targetWorkDate, watch } = useContext(AttendanceEditContext);
  const [totalWorkTime, setTotalWorkTime] = useState<number>(0);

  useEffect(() => {
    if (!watch) return;

    watch((data) => {
      const { startTime, endTime } = data;
      if (!startTime || !endTime) {
        setTotalWorkTime(0);
        return;
      }

      const diff = calcTotalWorkTime(startTime, endTime);
      setTotalWorkTime(diff);
    });
  }, [watch]);

  if (!targetWorkDate) {
    return null;
  }

  return (
    <Stack
      direction="row"
      alignItems={"center"}
      sx={{ boxSizing: "border-box" }}
    >
      <Box sx={{ fontWeight: "bold", width: "150px" }}>勤務時間</Box>
      <Box sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={2} alignItems={"center"}>
          <Box>
            <Stack direction="row" spacing={1}>
              <Box>
                <StartTimeInput
                  dataTestId="desktop-start-time-input"
                  highlight={highlightStartTime}
                />
              </Box>
              <Box>
                <Typography variant="body1" sx={{ py: 1 }}>
                  ～
                </Typography>
              </Box>
              <Box>
                <EndTimeInput
                  dataTestId="desktop-end-time-input"
                  highlight={highlightEndTime}
                />
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
