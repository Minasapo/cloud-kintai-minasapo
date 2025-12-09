import { TableCell, TableRow } from "@mui/material";
import { Attendance } from "@shared/api/graphql/types";

export default function PaidHolidayFlagTableRow({
  value,
}: {
  value: Attendance["paidHolidayFlag"];
}) {
  return (
    <TableRow>
      <TableCell>有給休暇</TableCell>
      <TableCell>{value ? "あり" : "なし"}</TableCell>
    </TableRow>
  );
}
