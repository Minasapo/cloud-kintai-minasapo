import DeleteIcon from "@mui/icons-material/Delete";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { FieldArrayWithId } from "react-hook-form";

import { AttendanceEditContext } from "@/pages/AttendanceEdit/AttendanceEditProvider";
import { AttendanceEditInputs } from "@/pages/AttendanceEdit/common";

import HourlyPaidHolidayEndTimeInput from "./HourlyPaidHolidayEndTimeInput";
import HourlyPaidHolidayStartTimeInput from "./HourlyPaidHolidayStartTimeInput";

export function calcTotalHourlyPaidHolidayTime(
  startTime: string | null | undefined,
  endTime: string | null | undefined
) {
  if (!startTime) return 0;

  const now = dayjs();
  const diff = dayjs(endTime || now).diff(dayjs(startTime), "hour", true);
  return diff;
}

export default function HourlyPaidHolidayTimeItem({
  time,
  index,
}: {
  time: FieldArrayWithId<AttendanceEditInputs, "hourlyPaidHolidayTimes", "id">;
  index: number;
}) {
  const { hourlyPaidHolidayTimeRemove, changeRequests } = useContext(
    AttendanceEditContext
  );

  const [totalHourlyPaidHolidayTime, setTotalHourlyPaidHolidayTime] =
    useState<number>(0);

  useEffect(() => {
    if (!time.endTime) {
      setTotalHourlyPaidHolidayTime(0);
      return;
    }

    setTotalHourlyPaidHolidayTime(
      calcTotalHourlyPaidHolidayTime(time.startTime, time.endTime)
    );
  }, [time]);

  return (
    <Box>
      <Stack direction="row" spacing={1}>
        <HourlyPaidHolidayStartTimeInput index={index} time={time} />
        <Box>
          <Typography variant="body1" sx={{ my: 1 }}>
            ～
          </Typography>
        </Box>
        <HourlyPaidHolidayEndTimeInput index={index} time={time} />
        <Box>
          <IconButton
            aria-label="delete-hourly-paid-holiday-time"
            onClick={() => hourlyPaidHolidayTimeRemove(index)}
            disabled={changeRequests.length > 0}
            aria-disabled={changeRequests.length > 0}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
        <Box sx={{ flexGrow: 1 }} textAlign={"right"}>
          <Typography variant="body1">
            {`${totalHourlyPaidHolidayTime.toFixed(1)} 時間`}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
