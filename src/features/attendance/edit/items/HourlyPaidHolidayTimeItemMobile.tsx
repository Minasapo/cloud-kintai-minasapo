import DeleteIcon from "@mui/icons-material/Delete";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { useContext } from "react";
import { FieldArrayWithId } from "react-hook-form";

import { AttendanceEditContext } from "@/pages/attendance/edit/AttendanceEditProvider";
import { AttendanceEditInputs } from "@/pages/attendance/edit/common";

import HourlyPaidHolidayEndTimeInput from "./HourlyPaidHolidayEndTimeInput";
import HourlyPaidHolidayStartTimeInput from "./HourlyPaidHolidayStartTimeInput";
import { calcTotalHourlyPaidHolidayTime } from "./HourlyPaidHolidayTimeItem";

export default function HourlyPaidHolidayTimeItemMobile({
  time,
  index,
}: {
  time: FieldArrayWithId<AttendanceEditInputs, "hourlyPaidHolidayTimes", "id">;
  index: number;
}) {
  const { hourlyPaidHolidayTimeRemove, readOnly } = useContext(
    AttendanceEditContext
  );

  const totalHourlyPaidHolidayTime = calcTotalHourlyPaidHolidayTime(
    time.startTime,
    time.endTime
  );

  return (
    <Box sx={{ mb: 1 }}>
      <Stack
        direction="column"
        spacing={1}
        sx={{
          p: 1,
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        {/* 開始時刻 */}
        <HourlyPaidHolidayStartTimeInput index={index} time={time} />

        {/* 終了時刻 */}
        <HourlyPaidHolidayEndTimeInput index={index} time={time} />

        {/* 削除ボタン + 合計時間 */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <IconButton
            aria-label="delete-hourly-paid-holiday-time"
            onClick={() => hourlyPaidHolidayTimeRemove(index)}
            size="small"
            disabled={!!readOnly}
          >
            <DeleteIcon />
          </IconButton>
          <Box textAlign="right">
            <Typography variant="body2">
              {`${totalHourlyPaidHolidayTime.toFixed(1)} 時間`}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
