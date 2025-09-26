import { TableCell, TableRow } from "@mui/material";

import { AttendanceChangeRequest } from "../../../../API";

export default function RemarksTableRow({
  value,
  beforeValue,
}: {
  value: AttendanceChangeRequest["remarks"];
  beforeValue?: import("../../../../API").Attendance["remarks"];
}) {
  const changed = (value ?? null) !== (beforeValue ?? null);

  return (
    <TableRow>
      <TableCell>備考</TableCell>
      <TableCell
        sx={changed ? { color: "error.main", fontWeight: "bold" } : {}}
      >
        {value && value !== "" ? value : "(変更なし)"}
      </TableCell>
    </TableRow>
  );
}
