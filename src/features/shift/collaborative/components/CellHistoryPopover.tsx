import {
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React from "react";

import {
  CellChangeRecord,
  CellChangeSource,
  ShiftState,
} from "../types/collaborative.types";

const SHIFT_STATE_LABELS: Record<ShiftState, string> = {
  work: "出勤",
  fixedOff: "固定休",
  requestedOff: "希望休",
  auto: "自動調整枠",
  empty: "未入力",
};

const SOURCE_LABELS: Record<CellChangeSource, string> = {
  manual: "手動",
  batch: "一括",
  undo: "取り消し",
  redo: "やり直し",
  "conflict-resolution": "競合解決",
  remote: "リモート",
};

const SOURCE_COLORS: Record<
  CellChangeSource,
  "default" | "primary" | "secondary" | "warning" | "info" | "error"
> = {
  manual: "primary",
  batch: "secondary",
  undo: "warning",
  redo: "info",
  "conflict-resolution": "error",
  remote: "default",
};

const formatShiftState = (state?: ShiftState) =>
  state ? SHIFT_STATE_LABELS[state] : "未設定";

interface CellHistoryPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  cellKey: string;
  records: readonly CellChangeRecord[];
  staffName?: string;
  maxVisible?: number;
}

export const CellHistoryPopover: React.FC<CellHistoryPopoverProps> = ({
  anchorEl,
  open,
  onClose,
  cellKey,
  records,
  staffName,
  maxVisible = 20,
}) => {
  const [, date] = cellKey.split("#");
  const displayLabel = staffName ? `${staffName} / ${date}日` : `${date}日`;
  const visibleRecords = records.slice(0, maxVisible);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      slotProps={{
        paper: {
          sx: { maxWidth: 360, maxHeight: 400 },
        },
      }}
    >
      <Box sx={{ p: 1.5 }}>
        <Typography variant="subtitle2" gutterBottom>
          {displayLabel} の変更履歴
        </Typography>
        <Divider sx={{ mb: 1 }} />
        {visibleRecords.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            変更履歴はありません
          </Typography>
        ) : (
          <List dense disablePadding>
            {visibleRecords.map((record) => (
              <ListItem key={record.id} disableGutters sx={{ py: 0.5 }}>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(record.changedAt).format("M/D HH:mm:ss")}
                      </Typography>
                      <Chip
                        size="small"
                        label={SOURCE_LABELS[record.source]}
                        color={SOURCE_COLORS[record.source]}
                        variant="outlined"
                        sx={{ height: 18, fontSize: "0.65rem" }}
                      />
                    </Stack>
                  }
                  primaryTypographyProps={{ component: "div" }}
                  secondary={
                    <Stack spacing={0}>
                      <Typography variant="caption" color="text.primary">
                        {formatShiftState(record.previousState)} →{" "}
                        {formatShiftState(record.newState)}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        変更者: {record.changedByName || "不明"}
                      </Typography>
                    </Stack>
                  }
                  secondaryTypographyProps={{ component: "div" }}
                />
              </ListItem>
            ))}
          </List>
        )}
        {records.length > maxVisible && (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ mt: 0.5, display: "block" }}
          >
            他 {records.length - maxVisible} 件
          </Typography>
        )}
      </Box>
    </Popover>
  );
};
