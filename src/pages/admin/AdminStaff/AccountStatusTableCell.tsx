import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { TableCell } from "@mui/material";

export function AccountStatusTableCell({ staff }: { staff: StaffType }) {
  const { enabled } = staff;
  const statusMap = new Map<boolean, string>([
    [true, "有効"],
    [false, "無効"],
  ]);
  return <TableCell>{statusMap.get(enabled) || "***"}</TableCell>;
}
