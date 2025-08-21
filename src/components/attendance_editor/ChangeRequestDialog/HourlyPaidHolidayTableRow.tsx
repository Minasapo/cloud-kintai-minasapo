import { TableCell, TableRow } from "@mui/material";
import dayjs from "dayjs";

import { HourlyPaidHolidayTime } from "../../../API";

export default function HourlyPaidHolidayTableRow({
  hours,
  times,
  variant = "before",
}: {
  hours?: number | null;
  times?: Array<HourlyPaidHolidayTime | null> | null;
  variant?: "before" | "after";
}) {
  const hasTimes =
    times &&
    times.filter((t): t is NonNullable<typeof t> => t !== null).length > 0;

  const renderValue = () => {
    if (variant === "after") {
      if (hours == null && !hasTimes) return "変更なし";
    } else {
      // hours が null の場合はこれまで通り登録なし表示にする
      if (hours == null && !hasTimes) return "(登録なし)";
      // hours が 0 の場合（00:00 表示相当）は "なし" を表示する
      if (hours === 0 && !hasTimes) return "なし";
    }

    if (hasTimes) {
      const list = times!
        .filter((t): t is NonNullable<typeof t> => t !== null)
        .map((t) => {
          try {
            return `${dayjs(t.startTime).format("HH:mm")}〜${dayjs(
              t.endTime
            ).format("HH:mm")}`;
          } catch (e) {
            return "";
          }
        })
        .filter((s) => s !== "");

      return list.join(", ");
    }

    if (hours != null && hours !== 0) {
      // hours が string など数値以外で来る可能性を考慮して Number に変換してから HH:mm 表記に変換
      const h = Number(hours);
      if (isNaN(h)) return String(hours);
      // 小数時間を分に変換（四捨五入）して HH:mm に整形
      const totalMinutes = Math.round(h * 60);
      const hh = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
      const mm = String(totalMinutes % 60).padStart(2, "0");
      return `${hh}:${mm}`;
    } else {
      return "なし";
    }

    return "";
  };

  return (
    <TableRow>
      <TableCell>時間単位休暇</TableCell>
      <TableCell>{renderValue()}</TableCell>
    </TableRow>
  );
}
