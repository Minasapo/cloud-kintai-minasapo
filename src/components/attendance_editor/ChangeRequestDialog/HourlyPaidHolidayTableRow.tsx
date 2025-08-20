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
      if ((hours == null || hours === 0) && !hasTimes) return "(登録なし)";
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

    if (hours != null) {
      // hours が string など数値以外で来る可能性を考慮して Number に変換してから固定小数表示
      const h = Number(hours);
      return `${isNaN(h) ? String(hours) : h.toFixed(1)} 時間`;
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
