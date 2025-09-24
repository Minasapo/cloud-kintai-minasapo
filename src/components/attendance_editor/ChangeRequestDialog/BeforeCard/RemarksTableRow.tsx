import { TableCell, TableRow } from "@mui/material";

import { Attendance } from "../../../../API";

export default function RemarksTableRow({
  value,
}: {
  value: Attendance["remarks"];
}) {
  return (
    <TableRow>
      <TableCell>備考</TableCell>
      <TableCell>{value && value !== "" ? value : "変更なし"}</TableCell>
    </TableRow>
  );
}
