import { TableCell, TableRow } from "@mui/material";
import { Attendance, AttendanceChangeRequest } from "@shared/api/graphql/types";

import { AttendanceDateTime } from "@/entities/attendance/lib/AttendanceDateTime";

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
