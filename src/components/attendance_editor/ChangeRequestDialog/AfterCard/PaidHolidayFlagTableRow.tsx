import { TableCell, TableRow } from "@mui/material";
import { AttendanceChangeRequest } from "@shared/api/graphql/types";

export default function PaidHolidayFlagTableRow({
  value,
  beforeValue,
}: {
  value: AttendanceChangeRequest["paidHolidayFlag"];
  beforeValue?: import("@shared/api/graphql/types").Attendance["paidHolidayFlag"];
}) {
  const changed =
    (value === null ? null : value) !==
    (beforeValue === null || beforeValue === undefined ? null : beforeValue);

  return (
    <TableRow>
      <TableCell>有給休暇</TableCell>
      <TableCell
        sx={changed ? { color: "error.main", fontWeight: "bold" } : {}}
      >
        {(() => {
          if (value === null) {
            return "(変更なし)";
          }

          return value ? "あり" : "なし";
        })()}
      </TableCell>
    </TableRow>
  );
}
