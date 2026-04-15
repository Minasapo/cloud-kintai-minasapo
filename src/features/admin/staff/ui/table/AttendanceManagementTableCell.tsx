import { isAttendanceManagementEnabled } from "@entities/staff/lib/attendanceManagement";
import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { TableCell } from "@mui/material";

export function AttendanceManagementTableCell({ staff }: { staff: StaffType }) {
  const isAttendanceManaged = isAttendanceManagementEnabled(staff);

  return <TableCell>{isAttendanceManaged ? "✓ 対象" : "✗ 対象外"}</TableCell>;
}

export default AttendanceManagementTableCell;
