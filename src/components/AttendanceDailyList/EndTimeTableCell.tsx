import { TableCell } from "@mui/material";
import dayjs from "dayjs";

import { Attendance } from "@shared/api/graphql/types";
import { AttendanceDaily } from "../../hooks/useAttendanceDaily/useAttendanceDaily";

export function EndTimeTableCell({
  row,
  attendances,
}: {
  row: AttendanceDaily;
  attendances?: Attendance[];
}) {
  // attendances が提供されている場合は、そこから最初の有効なデータを取得
  let endTime: string | null | undefined = undefined;

  if (attendances && attendances.length > 0) {
    // 有効な endTime を持つ最初の記録を探す
    for (const attendance of attendances) {
      if (attendance?.endTime) {
        endTime = attendance.endTime;
        break;
      }
    }
  }

  // attendances から見つからない場合は、row.attendance にフォールバック
  if (!endTime && row.attendance?.endTime) {
    endTime = row.attendance.endTime;
  }

  if (!endTime) return <TableCell />;

  const date = dayjs(endTime).format("H:mm");
  return <TableCell sx={{ textAlign: "right" }}>{date}</TableCell>;
}
