import { TableCell, TableRow } from "@mui/material";
import dayjs from "dayjs";

import { AttendanceTime } from "@/lib/AttendanceTime";

export default function WorkTimeTableRow({
  startTime,
  endTime,
  beforeStartTime,
  beforeEndTime,
}: {
  // raw ISO strings are passed so we can detect explicit empty-string clears
  startTime: string | null;
  endTime: string | null;
  beforeStartTime?: string | null;
  beforeEndTime?: string | null;
}) {
  const afterStartFormatted =
    startTime && startTime !== "" ? dayjs(startTime).format("HH:mm") : null;
  const afterEndFormatted =
    endTime && endTime !== "" ? dayjs(endTime).format("HH:mm") : null;

  const beforeStartFormatted =
    beforeStartTime && beforeStartTime !== ""
      ? dayjs(beforeStartTime).format("HH:mm")
      : null;
  const beforeEndFormatted =
    beforeEndTime && beforeEndTime !== ""
      ? dayjs(beforeEndTime).format("HH:mm")
      : null;

  const changed =
    (afterStartFormatted ?? null) !== (beforeStartFormatted ?? null) ||
    (afterEndFormatted ?? null) !== (beforeEndFormatted ?? null);

  return (
    <TableRow>
      <TableCell>勤務時間</TableCell>
      <TableCell
        sx={changed ? { color: "error.main", fontWeight: "bold" } : {}}
      >
        {(() => {
          // When both after values are falsy (null or empty string), decide between
          // "変更なし" and "空にしました" based on whether something actually changed.
          if (!startTime && !endTime) {
            return changed ? "空にしました" : "変更なし";
          }

          return `${afterStartFormatted ?? AttendanceTime.None} 〜 ${
            afterEndFormatted ?? AttendanceTime.None
          }`;
        })()}
      </TableCell>
    </TableRow>
  );
}
