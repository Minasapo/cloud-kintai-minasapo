import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import dayjs from "dayjs";

import { ShiftState } from "../../lib/generateMockShifts";
import {
  shiftStateOptions,
  statusVisualMap,
} from "../../lib/shiftStateMapping";
import { ShiftEditingTarget } from "../../model/useShiftManagementDialogs";

export type ShiftEditDialogProps = {
  open: boolean;
  editingCell: ShiftEditingTarget | null;
  editingState: ShiftState;
  isSaving: boolean;
  onClose: () => void;
  onStateChange: (state: ShiftState) => void;
  onSubmit: () => void;
};

export default function ShiftEditDialog({
  open,
  editingCell,
  editingState,
  isSaving,
  onClose,
  onStateChange,
  onSubmit,
}: ShiftEditDialogProps) {
  "use memo";

  const editingDialogDateLabel = editingCell
    ? dayjs(editingCell.dateKey).format("YYYY年M月D日 (dd)")
    : "";

  const handleClose = (_event: unknown, _reason?: string) => {
    if (isSaving) return;
    onClose();
  };

  const handleStateChange = (event: SelectChangeEvent<ShiftState>) => {
    onStateChange(event.target.value as ShiftState);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="shift-edit-dialog-title"
    >
      <DialogTitle id="shift-edit-dialog-title">シフトを変更</DialogTitle>
      <DialogContent dividers>
        {editingCell ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {editingCell.staffName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {editingDialogDateLabel}
            </Typography>
          </Box>
        ) : null}

        <FormControl fullWidth size="small">
          <InputLabel id="shift-edit-state-label">ステータス</InputLabel>
          <Select
            labelId="shift-edit-state-label"
            label="ステータス"
            value={editingState}
            onChange={handleStateChange}
            disabled={isSaving}
          >
            {shiftStateOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    component="span"
                    sx={{
                      color: statusVisualMap[option.value].color,
                      fontWeight: 700,
                    }}
                  >
                    {statusVisualMap[option.value].label}
                  </Typography>
                  <Typography component="span">{option.label}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          キャンセル
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={!editingCell || isSaving}
          startIcon={
            isSaving ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
        >
          {isSaving ? "保存中..." : "変更する"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
