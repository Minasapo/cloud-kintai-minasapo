import { TableCell, TableRow } from "@mui/material";
import { AttendanceChangeRequest } from "@shared/api/graphql/types";

export default function RemarksTableRow({
  value,
  beforeValue,
}: {
  value: AttendanceChangeRequest["remarks"];
  beforeValue?: import("@shared/api/graphql/types").Attendance["remarks"];
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
