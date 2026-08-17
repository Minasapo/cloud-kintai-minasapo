import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  type SxProps,
  type Theme,
} from "@mui/material";
import { type ReactNode } from "react";

import { ProgressBar } from "./LoadingPrimitives";

type AppDialogProps = {
  open: boolean;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  onClose: () => void;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  loading?: boolean;
  PaperSx?: SxProps<Theme>;
  sx?: SxProps<Theme>;
  testId?: string;
};

export default function AppDialog({
  open,
  title,
  description,
  actions,
  children,
  onClose,
  maxWidth = "sm",
  fullWidth = true,
  loading = false,
  PaperSx,
  sx,
  testId,
}: AppDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      keepMounted={false}
      sx={sx}
      PaperProps={{
        sx: PaperSx,
        ...(testId ? { "data-testid": testId } : {}),
      }}
    >
      {title && <DialogTitle>{title}</DialogTitle>}
      {loading && <ProgressBar />}
      <DialogContent>
        {description && (
          <DialogContentText sx={{ mb: children ? 2 : 0 }}>
            {description}
          </DialogContentText>
        )}
        {children}
      </DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
}
