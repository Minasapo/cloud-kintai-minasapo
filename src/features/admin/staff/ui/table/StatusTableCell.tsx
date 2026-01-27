import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { TableCell } from "@mui/material";

export function StatusTableCell({ staff }: { staff: StaffType }) {
  const { status } = staff;
  const statusMap = new Map<string, string>([
    ["CONFIRMED", "確認済み"],
    ["FORCE_CHANGE_PASSWORD", "パスワード変更必要"],
  ]);

  return <TableCell>{statusMap.get(status) || "***"}</TableCell>;
}
