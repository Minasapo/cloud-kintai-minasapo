import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { type ReactNode } from "react";

type AppDialogProps = {
  open: boolean;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  onClose: () => void;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
};

export default function AppDialog({
  open,
  title,
  description,
  actions,
  children,
  onClose,
  maxWidth = "sm",
}: AppDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      {title && <DialogTitle>{title}</DialogTitle>}
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
