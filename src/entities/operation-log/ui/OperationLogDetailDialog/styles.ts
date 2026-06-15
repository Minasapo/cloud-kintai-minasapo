import { SxProps, Theme } from "@mui/material";

export const operationLogDetailDialogStyles = {
  dialogTitle: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    pr: 6,
  } as SxProps<Theme>,
  timestamp: {
    mr: 1,
  } as SxProps<Theme>,
  closeButton: {
    position: "absolute",
    right: 8,
    top: 8,
  } as SxProps<Theme>,
  userAgent: {
    fontFamily: "monospace",
    wordBreak: "break-all",
  } as SxProps<Theme>,
} as const;
