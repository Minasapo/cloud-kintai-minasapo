import { TableCell } from "@mui/material";
import dayjs from "dayjs";

import { Attendance } from "@shared/api/graphql/types";
import { AttendanceDaily } from "../../hooks/useAttendanceDaily/useAttendanceDaily";

export function StartTimeTableCell({
  row,
  attendances,
}: {
  row: AttendanceDaily;
  attendances?: Attendance[];
}) {
  // attendances が提供されている場合は、そこから最初の有効なデータを取得
  let startTime: string | null | undefined = undefined;

  if (attendances && attendances.length > 0) {
    // 有効な startTime を持つ最初の記録を探す
    for (const attendance of attendances) {
      if (attendance?.startTime) {
        startTime = attendance.startTime;
        break;
      }
    }
  }

  // attendances から見つからない場合は、row.attendance にフォールバック
  if (!startTime && row.attendance?.startTime) {
    startTime = row.attendance.startTime;
  }

  if (!startTime) return <TableCell />;

  const date = dayjs(startTime).format("H:mm");
  return <TableCell sx={{ textAlign: "right" }}>{date}</TableCell>;
}
