import { TableCell, TableRow } from "@mui/material";
import { Attendance, AttendanceChangeRequest } from "@shared/api/graphql/types";

export default function SpecialHolidayFlagTableRow({
  value,
  beforeValue,
}: {
  value:
    | Attendance["specialHolidayFlag"]
    | AttendanceChangeRequest["specialHolidayFlag"];
  beforeValue?: Attendance["specialHolidayFlag"] | null;
}) {
  const changed =
    (value === null ? null : value) !==
    (beforeValue === null ? null : beforeValue);

  return (
    <TableRow>
      <TableCell>特別休暇</TableCell>
      <TableCell
        sx={changed ? { color: "error.main", fontWeight: "bold" } : {}}
      >
        {value ? "あり" : "なし"}
      </TableCell>
    </TableRow>
  );
}
