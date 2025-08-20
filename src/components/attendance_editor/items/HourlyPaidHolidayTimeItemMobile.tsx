import DeleteIcon from "@mui/icons-material/Delete";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { useContext } from "react";
import { FieldArrayWithId } from "react-hook-form";

import { AttendanceEditContext } from "@/pages/AttendanceEdit/AttendanceEditProvider";
import { AttendanceEditInputs } from "@/pages/AttendanceEdit/common";

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
  const { hourlyPaidHolidayTimeRemove } = useContext(AttendanceEditContext);

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
        {/* 1行目: 開始 / 終了 */}
        <Stack direction="row" spacing={1} alignItems="center">
          <HourlyPaidHolidayStartTimeInput index={index} time={time} />
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body1" sx={{ mx: 0.5 }}>
              ～
            </Typography>
          </Box>
          <HourlyPaidHolidayEndTimeInput index={index} time={time} />
          <Box sx={{ flexGrow: 1 }} />
        </Stack>

        {/* 2行目: 削除ボタン + 合計時間 */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <IconButton
            aria-label="delete-hourly-paid-holiday-time"
            onClick={() => hourlyPaidHolidayTimeRemove(index)}
            size="small"
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
