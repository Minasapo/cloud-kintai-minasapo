import { TableCell, TableRow } from "@mui/material";

import { AttendanceChangeRequest } from "../../../../API";

export default function ReturnDirectlyFlagTableRow({
  value,
  beforeValue,
}: {
  value: AttendanceChangeRequest["returnDirectlyFlag"];
  beforeValue?: import("../../../../API").Attendance["returnDirectlyFlag"];
}) {
  const changed =
    (value === null ? null : value) !==
    (beforeValue === null || beforeValue === undefined ? null : beforeValue);

  return (
    <TableRow>
      <TableCell>直帰</TableCell>
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
