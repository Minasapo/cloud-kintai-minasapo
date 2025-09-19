import { TableCell } from "@mui/material";

import { StaffType } from "../../../hooks/useStaffs/useStaffs";
import { getWorkTypeLabel } from "./workTypeOptions";

export function WorkTypeTableCell({ staff }: { staff: StaffType }) {
  const label = getWorkTypeLabel(
    (staff as unknown as Record<string, unknown>).workType as string | null
  );
  return <TableCell>{label}</TableCell>;
}

export default WorkTypeTableCell;
