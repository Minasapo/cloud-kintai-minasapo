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
  // endTime が提供されていればそれを優先して解析し、なければ現在時刻を使用する
  const start = dayjs(startTime);
  const end = endTime ? dayjs(endTime) : now;

  // 解析に失敗した場合は NaN の連鎖を避けるため 0 と扱う
  if (!start.isValid() || !end.isValid()) return 0;

  // 浮動小数点の誤差を避けるため差分を分単位で計算する
  const diffMinutes = end.diff(start, "minute", true);
  if (!isFinite(diffMinutes) || diffMinutes <= 0) return 0;

  // 時間に変換（丸めなし）。呼び出し元が正確な小数時間を表示できるようにする
  return diffMinutes / 60;
}

export default function HourlyPaidHolidayTimeItem({
  time,
  index,
}: {
  time: FieldArrayWithId<AttendanceEditInputs, "hourlyPaidHolidayTimes", "id">;
  index: number;
}) {
  const { hourlyPaidHolidayTimeRemove, changeRequests, readOnly } = useContext(
    AttendanceEditContext
  );

  const [totalHourlyPaidHolidayTime, setTotalHourlyPaidHolidayTime] =
    useState<number>(0);

  useEffect(() => {
    const start = time.startTime;
    const end = time.endTime;

    if (!start || !end) {
      setTotalHourlyPaidHolidayTime(0);
      return;
    }

    const diff = calcTotalHourlyPaidHolidayTime(start, end);
    setTotalHourlyPaidHolidayTime(diff);
  }, [time.startTime, time.endTime, index]);

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
            disabled={changeRequests.length > 0 || !!readOnly}
            aria-disabled={changeRequests.length > 0 || !!readOnly}
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
  // 常に小数点1桁で表示する（例: 0.0, 0.5, 1.3）
  if (hours == null || hours <= 0) return `0.0時間`;
  return `${hours.toFixed(1)}時間`;
}

// コンポーネントで使われていた旧名を保持
function formatHoursToHourMinute(hours: number) {
  return formatHoursToDecimal(hours);
}
