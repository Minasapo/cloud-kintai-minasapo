import {
  roleLabelMap,
  StaffRole,
  StaffType,
} from "@entities/staff/model/useStaffs/useStaffs";
import { TableCell } from "@mui/material";

export function RoleTableCell({ staff }: { staff: StaffType }) {
  const { role, owner } = staff;

  // オーナー権限が設定されている場合は優先的に表示
  if (owner) {
    return (
      <TableCell>{roleLabelMap.get(StaffRole.OWNER) ?? "オーナー"}</TableCell>
    );
  }

  // role に対応するラベルを取得、なければ未設定を表示
  const roleLabel =
    roleLabelMap.get(role) ?? roleLabelMap.get(StaffRole.NONE) ?? "未設定";
  return <TableCell>{roleLabel}</TableCell>;
}
