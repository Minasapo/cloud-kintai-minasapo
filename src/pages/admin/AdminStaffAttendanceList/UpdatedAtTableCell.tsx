import { styled, TableCell as MuiTableCell } from "@mui/material";
import { Attendance } from "@shared/api/graphql/types";
import dayjs from "dayjs";

const TableCell = styled(MuiTableCell)(({ theme }) => ({
  width: theme.spacing(18),
  minWidth: theme.spacing(18),
  textAlign: "right",
}));

export function UpdatedAtTableCell({
  updatedAt,
}: {
  updatedAt: Attendance["updatedAt"];
}) {
  const date = updatedAt ? dayjs(updatedAt).format("YYYY/MM/DD HH:mm") : "";
  return <TableCell>{date}</TableCell>;
}
