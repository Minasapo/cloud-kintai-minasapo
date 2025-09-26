import { TableCell, TableRow } from "@mui/material";

import { AttendanceChangeRequest } from "../../../../API";

export default function GoDirectlyFlagTableRow({
  value,
  beforeValue,
}: {
  value: AttendanceChangeRequest["goDirectlyFlag"];
  beforeValue?: import("../../../../API").Attendance["goDirectlyFlag"];
}) {
  const changed =
    (value === null ? null : value) !==
    (beforeValue === null || beforeValue === undefined ? null : beforeValue);

  return (
    <TableRow>
      <TableCell>直行</TableCell>
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
