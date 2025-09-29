import { TableCell, TableRow } from "@mui/material";
import dayjs from "dayjs";

import { AttendanceTime } from "@/lib/AttendanceTime";

export default function WorkTimeTableRow({
  startTime,
  endTime,
  beforeStartTime,
  beforeEndTime,
}: {
  startTime: dayjs.Dayjs | null;
  endTime: dayjs.Dayjs | null;
  beforeStartTime?: dayjs.Dayjs | null;
  beforeEndTime?: dayjs.Dayjs | null;
}) {
  const changed =
    (startTime?.format("HH:mm") ?? null) !==
      (beforeStartTime?.format("HH:mm") ?? null) ||
    (endTime?.format("HH:mm") ?? null) !==
      (beforeEndTime?.format("HH:mm") ?? null);

  return (
    <TableRow>
      <TableCell>勤務時間</TableCell>
      <TableCell
        sx={changed ? { color: "error.main", fontWeight: "bold" } : {}}
      >
        {(() => {
          if (!startTime && !endTime) {
            return "変更なし";
          }

          return `${startTime?.format("HH:mm") ?? AttendanceTime.None} 〜 ${
            endTime?.format("HH:mm") ?? AttendanceTime.None
          }`;
        })()}
      </TableCell>
    </TableRow>
  );
}
