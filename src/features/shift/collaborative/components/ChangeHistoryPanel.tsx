import {
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useMemo } from "react";

import { HistoryEntry } from "../hooks/useUndoRedo";

export type ChangeHistoryEntry = HistoryEntry & {
  status: "undo" | "redo";
};

interface ChangeHistoryPanelProps {
  undoHistory: HistoryEntry[];
  redoHistory: HistoryEntry[];
  maxVisible?: number;
  open: boolean;
  onClose: () => void;
}

export const ChangeHistoryPanel: React.FC<ChangeHistoryPanelProps> = ({
  undoHistory,
  redoHistory,
  maxVisible = 10,
  open,
  onClose,
}) => {
  const entries = useMemo<ChangeHistoryEntry[]>(() => {
    const undoEntries = undoHistory.map((entry) => ({
      ...entry,
      status: "undo" as const,
    }));
    const redoEntries = redoHistory.map((entry) => ({
      ...entry,
      status: "redo" as const,
    }));

    return [...undoEntries, ...redoEntries]
      .toSorted((a, b) => b.timestamp - a.timestamp)
      .slice(0, maxVisible);
  }, [redoHistory, undoHistory, maxVisible]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: "80vh",
        },
      }}
    >
      <DialogTitle>変更履歴</DialogTitle>
      <DialogContent dividers>
        {entries.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            変更履歴はありません
          </Typography>
        ) : (
          <List dense disablePadding>
            {entries.map((entry) => (
              <ListItem
                key={entry.id}
                divider
                sx={{ alignItems: "flex-start" }}
              >
                <ListItemText
                  primary={entry.description || "シフト変更"}
                  secondary={dayjs(entry.timestamp).format("M/D HH:mm")}
                />
                <Chip
                  size="small"
                  label={
                    entry.status === "undo" ? "取り消し可能" : "やり直し可能"
                  }
                  color={entry.status === "undo" ? "default" : "warning"}
                  variant="outlined"
                  sx={{ ml: 1, mt: 0.5 }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};
