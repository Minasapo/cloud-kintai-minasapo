import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { TableCell } from "@mui/material";
import dayjs from "dayjs";

export function UpdatedAtTableCell({ staff }: { staff: StaffType }) {
  const { updatedAt } = staff;
  const formattedDate = dayjs(updatedAt).format("YYYY/MM/DD HH:mm");

  return <TableCell>{formattedDate}</TableCell>;
}
