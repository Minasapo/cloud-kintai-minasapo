import { TableCell, TableRow } from "@mui/material";
import { Attendance } from "@shared/api/graphql/types";

export default function ReturnDirectlyFlagTableRow({
  value,
}: {
  value: Attendance["returnDirectlyFlag"];
}) {
  return (
    <TableRow>
      <TableCell>直帰</TableCell>
      <TableCell>{value ? "あり" : "なし"}</TableCell>
    </TableRow>
  );
}
