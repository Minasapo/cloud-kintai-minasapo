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

import { ShiftState } from "../../lib/generateMockShifts";
import {
  shiftStateOptions,
  statusVisualMap,
} from "../../lib/shiftStateMapping";

export type ShiftBulkEditDialogProps = {
  open: boolean;
  selectedStaffCount: number;
  selectedDayCount: number;
  selectedCellCount: number;
  bulkEditState: ShiftState;
  isSaving: boolean;
  canSubmit: boolean;
  onClose: () => void;
  onStateChange: (state: ShiftState) => void;
  onSubmit: () => void;
};

export default function ShiftBulkEditDialog({
  open,
  selectedStaffCount,
  selectedDayCount,
  selectedCellCount,
  bulkEditState,
  isSaving,
  canSubmit,
  onClose,
  onStateChange,
  onSubmit,
}: ShiftBulkEditDialogProps) {
  "use memo";

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
      aria-labelledby="shift-bulk-edit-dialog-title"
    >
      <DialogTitle id="shift-bulk-edit-dialog-title">
        選択した項目を一括変更
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2">
            選択スタッフ: {selectedStaffCount} 名
          </Typography>
          <Typography variant="body2">
            選択日付: {selectedDayCount} 日
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            対象セル: {selectedCellCount} 件
          </Typography>
        </Box>

        <FormControl fullWidth size="small">
          <InputLabel id="shift-bulk-edit-state-label">ステータス</InputLabel>
          <Select
            labelId="shift-bulk-edit-state-label"
            label="ステータス"
            value={bulkEditState}
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
          disabled={!canSubmit || isSaving}
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
