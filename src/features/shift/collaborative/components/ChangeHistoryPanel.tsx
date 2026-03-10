import {
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonBase,
  Chip,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useCallback, useMemo, useState } from "react";

import { HistoryEntry } from "../hooks/useUndoRedo";
import {
  CellChangeRecord,
  CellChangeSource,
  ShiftState,
} from "../types/collaborative.types";

export type ChangeHistoryEntry = HistoryEntry & {
  status: "undo" | "redo";
};

interface ChangeHistoryPanelProps {
  undoHistory: HistoryEntry[];
  redoHistory: HistoryEntry[];
  cellHistory?: readonly CellChangeRecord[];
  maxVisible?: number;
  staffNameMap?: Map<string, string>;
  open: boolean;
  onClose: () => void;
  initialCellKey?: string;
  focusCellKey?: string;
}

const DRAWER_WIDTH = 400;

const SHIFT_STATE_LABELS: Record<ShiftState, string> = {
  work: "出勤",
  fixedOff: "固定休",
  requestedOff: "希望休",
  auto: "自動調整枠",
  empty: "未入力",
};

const formatShiftState = (state?: ShiftState) =>
  state ? SHIFT_STATE_LABELS[state] : "未設定";

const formatLockState = (locked?: boolean) =>
  locked === undefined ? "未設定" : locked ? "ロック" : "解除";

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

export const ChangeHistoryPanel: React.FC<ChangeHistoryPanelProps> = ({
  undoHistory,
  redoHistory,
  cellHistory = [],
  maxVisible = 50,
  staffNameMap,
  open,
  onClose,
  initialCellKey,
  focusCellKey,
}) => {
  const [tabIndex, setTabIndex] = useState(initialCellKey ? 1 : 0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [cellFilter, setCellFilter] = useState(initialCellKey ?? "all");

  const [prevFocusCellKey, setPrevFocusCellKey] = useState(focusCellKey);
  if (focusCellKey && focusCellKey !== prevFocusCellKey) {
    setPrevFocusCellKey(focusCellKey);
    const cellKey = focusCellKey.includes("@")
      ? focusCellKey.split("@")[0]
      : focusCellKey;
    setCellFilter(cellKey);
    setTabIndex(1);
  }

  // --- 操作単位タブ用 ---
  const entries = useMemo<ChangeHistoryEntry[]>(() => {
    const undoEntries = undoHistory.map((entry) => ({
      ...entry,
      status: "undo" as const,
    }));
    const redoEntries = redoHistory.map((entry) => ({
      ...entry,
      status: "redo" as const,
    }));

    return [...undoEntries, ...redoEntries].toSorted(
      (a, b) => b.timestamp - a.timestamp,
    );
  }, [redoHistory, undoHistory]);

  // --- 共通: ユーザーオプション ---
  const userOptions = useMemo(() => {
    const operationNames = entries
      .map((entry) => entry.userName)
      .filter((name): name is string => Boolean(name));
    const cellNames = cellHistory
      .map((record) => record.changedByName)
      .filter(Boolean);
    return Array.from(new Set([...operationNames, ...cellNames])).toSorted();
  }, [entries, cellHistory]);

  // --- セル単位タブ用: セルキーオプション ---
  const cellKeyOptions = useMemo(() => {
    const keys = new Set(cellHistory.map((record) => record.cellKey));
    return Array.from(keys).toSorted();
  }, [cellHistory]);

  // --- 操作単位フィルタ ---
  const filteredEntries = useMemo(() => {
    const start = startDate ? dayjs(startDate).startOf("day") : null;
    const end = endDate ? dayjs(endDate).endOf("day") : null;

    const filtered = entries.filter((entry) => {
      if (userFilter !== "all" && entry.userName !== userFilter) {
        return false;
      }

      const entryTime = dayjs(entry.timestamp);
      if (start && entryTime.isBefore(start)) {
        return false;
      }
      if (end && entryTime.isAfter(end)) {
        return false;
      }

      return true;
    });

    return filtered.slice(0, maxVisible);
  }, [entries, startDate, endDate, userFilter, maxVisible]);

  // --- セル単位フィルタ ---
  const filteredCellRecords = useMemo(() => {
    const start = startDate ? dayjs(startDate).startOf("day") : null;
    const end = endDate ? dayjs(endDate).endOf("day") : null;

    const filtered = cellHistory.filter((record) => {
      if (cellFilter !== "all" && record.cellKey !== cellFilter) {
        return false;
      }
      if (userFilter !== "all" && record.changedByName !== userFilter) {
        return false;
      }

      const recordTime = dayjs(record.changedAt);
      if (start && recordTime.isBefore(start)) {
        return false;
      }
      if (end && recordTime.isAfter(end)) {
        return false;
      }

      return true;
    });

    return filtered.slice(0, maxVisible);
  }, [cellHistory, cellFilter, userFilter, startDate, endDate, maxVisible]);

  const handleResetFilters = useCallback(() => {
    setStartDate("");
    setEndDate("");
    setUserFilter("all");
    setCellFilter("all");
  }, []);

  const formatCellKeyLabel = useCallback(
    (cellKey: string) => {
      const [staffId, date] = cellKey.split("#");
      const staffName = staffNameMap?.get(staffId) ?? staffId;
      return `${staffName} / ${date}日`;
    },
    [staffNameMap],
  );

  const navigateToCellHistory = useCallback((cellKey: string) => {
    setCellFilter(cellKey);
    setTabIndex(1);
  }, []);

  const handleBackToCellList = useCallback(() => {
    setCellFilter("all");
  }, []);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="persistent"
      sx={{
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          変更履歴
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Box sx={{ overflow: "auto", flex: 1, px: 2, py: 1.5 }}>
        <Stack spacing={2}>
          <Tabs
            value={tabIndex}
            onChange={(_, newValue) => setTabIndex(newValue)}
            variant="fullWidth"
          >
            <Tab label="操作単位" />
            <Tab label="セル単位" />
          </Tabs>

          {/* セル単位タブで特定セル絞り込み中の戻るバー */}
          {tabIndex === 1 && cellFilter !== "all" && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Tooltip title="セル一覧に戻る">
                <IconButton size="small" onClick={handleBackToCellList}>
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Chip
                label={formatCellKeyLabel(cellFilter)}
                size="small"
                color="primary"
                onDelete={handleBackToCellList}
              />
            </Stack>
          )}

          {/* フィルター */}
          <Stack spacing={1}>
            <Stack direction="row" spacing={1}>
              <TextField
                label="開始日"
                type="date"
                size="small"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="終了日"
                type="date"
                size="small"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="flex-end">
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel id="change-history-user-filter-label">
                  ユーザー
                </InputLabel>
                <Select
                  labelId="change-history-user-filter-label"
                  label="ユーザー"
                  value={userFilter}
                  onChange={(event) => setUserFilter(event.target.value)}
                >
                  <MenuItem value="all">すべて</MenuItem>
                  {userOptions.map((userName) => (
                    <MenuItem key={userName} value={userName}>
                      {userName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {tabIndex === 1 && (
                <FormControl size="small" sx={{ flex: 1 }}>
                  <InputLabel id="change-history-cell-filter-label">
                    セル
                  </InputLabel>
                  <Select
                    labelId="change-history-cell-filter-label"
                    label="セル"
                    value={cellFilter}
                    onChange={(event) => setCellFilter(event.target.value)}
                  >
                    <MenuItem value="all">すべて</MenuItem>
                    {cellKeyOptions.map((cellKey) => (
                      <MenuItem key={cellKey} value={cellKey}>
                        {formatCellKeyLabel(cellKey)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <Button
                variant="text"
                size="small"
                onClick={handleResetFilters}
                sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
              >
                リセット
              </Button>
            </Stack>
          </Stack>

          {/* 操作単位タブ */}
          {tabIndex === 0 && (
            <>
              {entries.length === 0 ? (
                <Typography variant="caption" color="text.secondary">
                  変更履歴はありません
                </Typography>
              ) : filteredEntries.length === 0 ? (
                <Typography variant="caption" color="text.secondary">
                  条件に一致する履歴はありません
                </Typography>
              ) : (
                <List dense disablePadding>
                  {filteredEntries.map((entry) => (
                    <ListItem
                      key={entry.id}
                      divider
                      sx={{ alignItems: "flex-start" }}
                    >
                      <ListItemText
                        primary={entry.description || "シフト変更"}
                        secondary={
                          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {dayjs(entry.timestamp).format("YYYY/M/D HH:mm")}{" "}
                              / {entry.userName || "不明"}
                            </Typography>
                            <Box component="div">
                              {entry.updates.map((update, index) => {
                                const cellKey = `${update.staffId}#${update.date}`;
                                const staffName =
                                  staffNameMap?.get(update.staffId) ??
                                  update.staffId;
                                const stateDiff = `${formatShiftState(update.previousState)} → ${formatShiftState(update.newState)}`;
                                const lockDiff =
                                  update.previousLocked === undefined &&
                                  update.isLocked === undefined
                                    ? null
                                    : `${formatLockState(update.previousLocked)} → ${formatLockState(update.isLocked)}`;

                                return (
                                  <ButtonBase
                                    key={`${update.staffId}-${update.date}-${index}`}
                                    onClick={() =>
                                      navigateToCellHistory(cellKey)
                                    }
                                    sx={{
                                      display: "flex",
                                      gap: 1,
                                      flexWrap: "wrap",
                                      textAlign: "left",
                                      width: "100%",
                                      borderRadius: 0.5,
                                      px: 0.5,
                                      "&:hover": {
                                        bgcolor: "action.hover",
                                      },
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      color="primary.main"
                                      sx={{
                                        textDecoration: "underline",
                                        cursor: "pointer",
                                      }}
                                    >
                                      {staffName} / {update.date}日
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {stateDiff}
                                    </Typography>
                                    {lockDiff && (
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        ロック: {lockDiff}
                                      </Typography>
                                    )}
                                  </ButtonBase>
                                );
                              })}
                            </Box>
                          </Stack>
                        }
                      />
                      <Chip
                        size="small"
                        label={
                          entry.status === "undo"
                            ? "取り消し可能"
                            : "やり直し可能"
                        }
                        color={entry.status === "undo" ? "default" : "warning"}
                        variant="outlined"
                        sx={{ ml: 1, mt: 0.5 }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          )}

          {/* セル単位タブ */}
          {tabIndex === 1 && (
            <>
              {cellHistory.length === 0 ? (
                <Typography variant="caption" color="text.secondary">
                  セル単位の変更履歴はありません
                </Typography>
              ) : filteredCellRecords.length === 0 ? (
                <Typography variant="caption" color="text.secondary">
                  条件に一致する履歴はありません
                </Typography>
              ) : (
                <List dense disablePadding>
                  {filteredCellRecords.map((record) => {
                    const staffName =
                      staffNameMap?.get(record.staffId) ?? record.staffId;
                    const stateDiff = `${formatShiftState(record.previousState)} → ${formatShiftState(record.newState)}`;
                    const lockDiff =
                      record.previousLocked === undefined &&
                      record.newLocked === undefined
                        ? null
                        : `${formatLockState(record.previousLocked)} → ${formatLockState(record.newLocked)}`;

                    return (
                      <ListItem
                        key={record.id}
                        divider
                        sx={{
                          alignItems: "flex-start",
                          ...(cellFilter === "all" && {
                            cursor: "pointer",
                            "&:hover": { bgcolor: "action.hover" },
                          }),
                        }}
                        onClick={
                          cellFilter === "all"
                            ? () => navigateToCellHistory(record.cellKey)
                            : undefined
                        }
                      >
                        <ListItemText
                          primary={
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Typography
                                variant="body2"
                                color={
                                  cellFilter === "all"
                                    ? "primary.main"
                                    : "text.primary"
                                }
                                sx={
                                  cellFilter === "all"
                                    ? { textDecoration: "underline" }
                                    : undefined
                                }
                              >
                                {staffName} / {record.date}日
                              </Typography>
                              <Chip
                                size="small"
                                label={SOURCE_LABELS[record.source]}
                                color={SOURCE_COLORS[record.source]}
                                variant="outlined"
                              />
                            </Stack>
                          }
                          secondary={
                            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {dayjs(record.changedAt).format(
                                  "YYYY/M/D HH:mm:ss",
                                )}{" "}
                                / {record.changedByName || "不明"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {stateDiff}
                              </Typography>
                              {lockDiff && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  ロック: {lockDiff}
                                </Typography>
                              )}
                              {record.operationId && (
                                <Typography
                                  variant="caption"
                                  color="text.disabled"
                                >
                                  操作ID: {record.operationId.slice(0, 12)}...
                                </Typography>
                              )}
                            </Stack>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
};
