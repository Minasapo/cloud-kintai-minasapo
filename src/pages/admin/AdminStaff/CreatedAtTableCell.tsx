import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { TableCell } from "@mui/material";
import dayjs from "dayjs";

export function CreatedAtTableCell({ staff }: { staff: StaffType }) {
  const { createdAt } = staff;
  const formattedDate = dayjs(createdAt).format("YYYY/MM/DD HH:mm");

  return <TableCell>{formattedDate}</TableCell>;
}
