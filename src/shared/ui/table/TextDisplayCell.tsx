import { TableCell } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

type Props = {
  value: ReactNode;
  sx?: SxProps<Theme>;
};

export function TextDisplayCell({ value, sx }: Props) {
  return <TableCell sx={sx}>{value}</TableCell>;
}
