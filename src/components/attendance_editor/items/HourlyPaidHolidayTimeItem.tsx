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
  const end = dayjs(endTime || now);
  const start = dayjs(startTime);

  // calculate difference in minutes to avoid floating-point imprecision
  const diffMinutes = end.diff(start, "minute", true);
  if (diffMinutes <= 0) return 0;

  // convert to hours (no rounding) so callers can display exact decimal hours
  const hours = diffMinutes / 60;
  return hours;
}

export default function HourlyPaidHolidayTimeItem({
  time,
  index,
}: {
  time: FieldArrayWithId<AttendanceEditInputs, "hourlyPaidHolidayTimes", "id">;
  index: number;
}) {
  const { hourlyPaidHolidayTimeRemove, changeRequests, watch } = useContext(
    AttendanceEditContext
  );

  const [totalHourlyPaidHolidayTime, setTotalHourlyPaidHolidayTime] =
    useState<number>(0);

  useEffect(() => {
    if (!watch) return;

    watch((data) => {
      const items = data.hourlyPaidHolidayTimes;
      if (!items) {
        setTotalHourlyPaidHolidayTime(0);
        return;
      }

      const item = items[index];
      if (!item) {
        setTotalHourlyPaidHolidayTime(0);
        return;
      }

      // if either side missing or both empty, show 0.0時間
      if (!item.startTime || !item.endTime) {
        setTotalHourlyPaidHolidayTime(0);
        return;
      }

      const diff = calcTotalHourlyPaidHolidayTime(item.startTime, item.endTime);
      setTotalHourlyPaidHolidayTime(diff);
    });
  }, [watch, index]);

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
            {totalHourlyPaidHolidayTime == null
              ? ""
              : formatHoursToHourMinute(totalHourlyPaidHolidayTime)}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function formatHoursToDecimal(hours: number) {
  // always show one decimal place (e.g. 0.0, 0.5, 1.3)
  if (hours == null || hours <= 0) return `0.0時間`;
  return `${hours.toFixed(1)}時間`;
}

// keep old name used in component
function formatHoursToHourMinute(hours: number) {
  return formatHoursToDecimal(hours);
}
