import { styled, TableCell as MuiTableCell } from "@mui/material";
import { Attendance } from "@shared/api/graphql/types";
import dayjs from "dayjs";

const TableCell = styled(MuiTableCell)(({ theme }) => ({
  width: theme.spacing(18),
  minWidth: theme.spacing(18),
  textAlign: "right",
}));

export function CreatedAtTableCell({
  createdAt,
}: {
  createdAt: Attendance["createdAt"];
}) {
  const date = createdAt ? dayjs(createdAt).format("YYYY/MM/DD HH:mm") : "";
  return <TableCell>{date}</TableCell>;
}
