import {
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
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
}

export const ChangeHistoryPanel: React.FC<ChangeHistoryPanelProps> = ({
  undoHistory,
  redoHistory,
  maxVisible = 10,
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
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        bottom: 96,
        left: 24,
        width: 280,
        maxHeight: 280,
        overflow: "auto",
        p: 1.5,
        zIndex: 1000,
      }}
    >
      <Stack spacing={1}>
        <Typography variant="subtitle2">変更履歴</Typography>

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
      </Stack>
    </Paper>
  );
};
