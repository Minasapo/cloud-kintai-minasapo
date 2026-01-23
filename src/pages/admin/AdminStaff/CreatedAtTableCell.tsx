import { TableCell } from "@mui/material";
import dayjs from "dayjs";

import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";

export function CreatedAtTableCell({ staff }: { staff: StaffType }) {
  const { createdAt } = staff;
  const formattedDate = dayjs(createdAt).format("YYYY/MM/DD HH:mm");

  return <TableCell>{formattedDate}</TableCell>;
}
