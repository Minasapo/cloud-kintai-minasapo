import { TableCell, TableRow } from "@mui/material";

import { AttendanceDateTime } from "@/lib/AttendanceDateTime";

import { Attendance, AttendanceChangeRequest } from "../../../../API";

export default function SubstituteHolidayDateTableRow({
  value,
  beforeValue,
}: {
  value:
    | Attendance["substituteHolidayDate"]
    | AttendanceChangeRequest["substituteHolidayDate"];
  beforeValue?: Attendance["substituteHolidayDate"] | null;
}) {
  const changed = (value ?? null) !== (beforeValue ?? null);

  return (
    <TableRow>
      <TableCell>振替休暇</TableCell>
      <TableCell
        sx={changed ? { color: "error.main", fontWeight: "bold" } : {}}
      >
        {value
          ? new AttendanceDateTime()
              .setDateString(String(value))
              .toDisplayDateFormat()
          : "なし"}
      </TableCell>
    </TableRow>
  );
}
