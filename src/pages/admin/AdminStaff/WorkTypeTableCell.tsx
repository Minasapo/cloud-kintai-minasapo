import { TableCell } from "@mui/material";

import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { getWorkTypeLabel } from "@/entities/staff/lib/workTypeOptions";

export function WorkTypeTableCell({ staff }: { staff: StaffType }) {
  const label = getWorkTypeLabel(
    (staff as unknown as Record<string, unknown>).workType as string | null
  );
  return <TableCell>{label}</TableCell>;
}

export default WorkTypeTableCell;
