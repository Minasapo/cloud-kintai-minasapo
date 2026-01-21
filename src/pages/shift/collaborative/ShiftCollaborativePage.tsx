import InfoIcon from "@mui/icons-material/Info";
import LockIcon from "@mui/icons-material/Lock";
import SyncIcon from "@mui/icons-material/Sync";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  Alert,
  Avatar,
  AvatarGroup,
  Box,
  Chip,
  Container,
  Fab,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import Page from "@shared/ui/page/Page";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";

import { useCollaborativeShift } from "../../../features/shift/collaborative/context/CollaborativeShiftContext";
import { CollaborativeShiftProvider } from "../../../features/shift/collaborative/providers/CollaborativeShiftProvider";
import { ShiftState } from "../../../features/shift/collaborative/types/collaborative.types";
import { KeyboardShortcutsHelp } from "../../../features/shift/collaborative/components/KeyboardShortcutsHelp";
import { BatchEditToolbar } from "../../../features/shift/collaborative/components/BatchEditToolbar";
import { useKeyboardShortcuts } from "../../../features/shift/collaborative/hooks/useKeyboardShortcuts";
import { useShiftNavigation } from "../../../features/shift/collaborative/hooks/useShiftNavigation";
import { useMultiSelect } from "../../../features/shift/collaborative/hooks/useMultiSelect";
import { useClipboard } from "../../../features/shift/collaborative/hooks/useClipboard";

// シフト状態の表示設定
const shiftStateConfig: Record<
  ShiftState,
  { label: string; color: string; text: string }
> = {
  work: { label: "○", color: "success.main", text: "出勤" },
  fixedOff: { label: "固", color: "error.main", text: "固定休" },
  requestedOff: { label: "希", color: "warning.main", text: "希望休" },
  auto: { label: "△", color: "info.main", text: "自動調整枠" },
  empty: { label: "-", color: "text.disabled", text: "未入力" },
};

/**
 * シフトセルコンポーネント
 */
interface ShiftCellProps {
  state: ShiftState;
  isLocked: boolean;
  isEditing: boolean;
  editorName?: string;
  lastChangedBy?: string;
  lastChangedAt?: string;
  onClick: (event: React.MouseEvent) => void;
  onRegisterRef?: (element: HTMLElement | null) => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  isFocused?: boolean;
  isSelected?: boolean;
}

// eslint-disable-next-line react/prop-types
const ShiftCell: React.FC<ShiftCellProps> = ({
  state,
  isLocked,
  isEditing,
  editorName,
  lastChangedBy,
  lastChangedAt,
  onClick,
  onRegisterRef,
  onMouseDown,
  onMouseEnter,
  isFocused = false,
  isSelected = false,
}: ShiftCellProps) => {
  const config = shiftStateConfig[state];
  const isPending = false; // TODO: pendingChangesから取得

  return (
    <TableCell
      ref={onRegisterRef}
      tabIndex={0}
      onClick={isLocked ? undefined : onClick}
      onMouseDown={isLocked ? undefined : onMouseDown}
      onMouseEnter={onMouseEnter}
      sx={{
        position: "relative",
        cursor: isLocked ? "not-allowed" : "pointer",
        minWidth: 50,
        maxWidth: 50,
        textAlign: "center",
        p: 0.5,
        bgcolor: isEditing
          ? alpha("#2196f3", 0.1)
          : isPending
          ? alpha("#ff9800", 0.1)
          : isSelected
          ? alpha("#9c27b0", 0.15)
          : "background.paper",
        border: isEditing
          ? "2px solid #2196f3"
          : isFocused
          ? "2px solid #9c27b0"
          : undefined,
        "&:hover": isLocked
          ? {}
          : {
              bgcolor: alpha("#2196f3", 0.05),
            },
        "&:focus": {
          outline: "none",
          border: "2px solid #9c27b0",
        },
        userSelect: "none", // ドラッグ選択時のテキスト選択を防止
      }}
    >
      <Tooltip
        title={
          isLocked ? (
            "確定済み"
          ) : isEditing ? (
            `${editorName}が編集中`
          ) : (
            <Box>
              <Typography variant="caption">{config.text}</Typography>
              {lastChangedBy && (
                <>
                  <br />
                  <Typography variant="caption">
                    {lastChangedBy} ({lastChangedAt})
                  </Typography>
                </>
              )}
            </Box>
          )
        }
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
            opacity: isLocked ? 0.5 : 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: config.color,
              fontWeight: 600,
            }}
          >
            {config.label}
          </Typography>
          {isLocked && <LockIcon sx={{ fontSize: 12 }} />}
          {isPending && (
            <Box
              sx={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                bgcolor: "warning.main",
              }}
            />
          )}
        </Box>
      </Tooltip>
    </TableCell>
  );
};

/**
 * メインコンポーネント（内部実装）
 */
const ShiftCollaborativePageInner: React.FC = () => {
  const {
    state,
    updateShift,
    isCellBeingEdited,
    getCellEditor,
    triggerSync,
    updateUserActivity,
  } = useCollaborativeShift();

  const [currentMonth] = useState(dayjs());
  const monthStart = useMemo(
    () => currentMonth.startOf("month"),
    [currentMonth]
  );
  const daysInMonth = monthStart.daysInMonth();

  const days = useMemo(
    () =>
      Array.from({ length: daysInMonth }).map((_, i) =>
        monthStart.add(i, "day")
      ),
    [monthStart, daysInMonth]
  );

  // スタッフリストを取得（shiftDataMapから）
  const staffIds = useMemo(
    () => Array.from(state.shiftDataMap.keys()),
    [state.shiftDataMap]
  );

  // 日付のキーリスト（DD形式）
  const dateKeys = useMemo(() => days.map((day) => day.format("DD")), [days]);

  // キーボードショートカット用の状態
  const [showHelp, setShowHelp] = useState(false);

  // フォーカス管理とナビゲーション
  const { focusedCell, registerCell, focusCell, navigate, clearFocus } =
    useShiftNavigation({
      staffIds,
      dates: dateKeys,
    });

  // 複数選択管理
  const {
    selectedCells,
    selectionCount,
    isCellSelected,
    selectCell,
    toggleCell,
    selectRange,
    startDragSelect,
    updateDragSelect,
    endDragSelect,
    selectAll,
    clearSelection,
    isDragging,
  } = useMultiSelect({
    staffIds,
    dates: dateKeys,
  });

  // シフト状態取得ヘルパー
  const getShiftState = useCallback(
    (staffId: string, date: string): ShiftState | undefined => {
      return state.shiftDataMap.get(staffId)?.get(date)?.state;
    },
    [state.shiftDataMap]
  );

  // クリップボード管理
  const { copy, paste, hasClipboard, clearClipboard } = useClipboard({
    staffIds,
    dates: dateKeys,
    getShiftState,
  });

  /**
   * セルの状態を変更
   */
  const changeCellState = useCallback(
    (staffId: string, date: string, newState: ShiftState) => {
      if (isCellBeingEdited(staffId, date)) {
        return;
      }

      updateUserActivity();
      void updateShift({ staffId, date, newState });
    },
    [isCellBeingEdited, updateUserActivity, updateShift]
  );

  /**
   * フォーカス中のセルまたは選択中のセルの状態を変更
   */
  const handleChangeState = useCallback(
    (newState: ShiftState) => {
      if (selectionCount > 0) {
        // 複数選択がある場合は、選択されたすべてのセルを変更
        selectedCells.forEach(({ staffId, date }) => {
          changeCellState(staffId, date, newState);
        });
      } else if (focusedCell) {
        // フォーカスされたセルのみ変更
        changeCellState(focusedCell.staffId, focusedCell.date, newState);
      }
    },
    [focusedCell, selectedCells, selectionCount, changeCellState]
  );

  /**
   * コピー処理
   */
  const handleCopy = useCallback(() => {
    if (selectionCount > 0) {
      copy(selectedCells);
    }
  }, [selectionCount, selectedCells, copy]);

  /**
   * ペースト処理
   */
  const handlePaste = useCallback(() => {
    if (!focusedCell) return;

    const updates = paste(focusedCell);
    updates.forEach(({ staffId, date, newState }) => {
      changeCellState(staffId, date, newState);
    });
  }, [focusedCell, paste, changeCellState]);

  /**
   * 全セルを選択
   */
  const handleSelectAll = useCallback(() => {
    selectAll();
  }, [selectAll]);

  /**
   * 選択解除・モーダルクローズ
   */
  const handleEscape = useCallback(() => {
    if (showHelp) {
      setShowHelp(false);
    } else {
      clearSelection();
      clearFocus();
      clearClipboard();
    }
  }, [showHelp, clearSelection, clearFocus, clearClipboard]);

  // キーボードショートカットの設定
  useKeyboardShortcuts({
    enabled: true,
    onNavigate: navigate,
    onChangeState: handleChangeState,
    onSelectAll: handleSelectAll,
    onShowHelp: () => setShowHelp(true),
    onEscape: handleEscape,
    onCopy: handleCopy,
    onPaste: handlePaste,
  });

  /**
   * セルクリックハンドラー
   */
  const handleCellClick = (
    staffId: string,
    date: string,
    event: React.MouseEvent
  ) => {
    if (isCellBeingEdited(staffId, date)) {
      return; // 他のユーザーが編集中
    }

    updateUserActivity();

    // Shift+クリック: 範囲選択
    if (event.shiftKey) {
      selectRange(staffId, date);
      return;
    }

    // Ctrl/Cmd+クリック: 個別追加選択
    if (event.ctrlKey || event.metaKey) {
      toggleCell(staffId, date);
      focusCell(staffId, date);
      return;
    }

    // 通常クリック: 単一選択して状態を循環
    selectCell(staffId, date);
    focusCell(staffId, date);

    const staffData = state.shiftDataMap.get(staffId);
    const cell = staffData?.get(date);

    if (!cell) return;

    const stateOrder: ShiftState[] = [
      "empty",
      "work",
      "requestedOff",
      "fixedOff",
      "auto",
    ];
    const currentIndex = stateOrder.indexOf(cell.state);
    const nextState =
      stateOrder[(currentIndex + 1) % stateOrder.length] || "empty";

    void updateShift({
      staffId,
      date,
      newState: nextState,
    });
  };

  /**
   * セルのマウスダウン（ドラッグ選択開始）
   */
  const handleCellMouseDown = useCallback(
    (staffId: string, date: string, event: React.MouseEvent) => {
      // 修飾キーがある場合はドラッグ選択しない
      if (event.shiftKey || event.ctrlKey || event.metaKey) {
        return;
      }

      startDragSelect(staffId, date);
    },
    [startDragSelect]
  );

  /**
   * セルのマウスエンター（ドラッグ選択更新）
   */
  const handleCellMouseEnter = useCallback(
    (staffId: string, date: string) => {
      if (isDragging) {
        updateDragSelect(staffId, date);
      }
    },
    [isDragging, updateDragSelect]
  );

  /**
   * マウスアップ（ドラッグ選択終了）
   */
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      endDragSelect();
    }
  }, [isDragging, endDragSelect]);

  /**
   * 手動同期
   */
  const handleSync = async () => {
    await triggerSync();
  };

  /**
   * 進捗計算
   */
  const progress = useMemo(() => {
    let confirmedCount = 0;
    let needsAdjustmentCount = 0;
    let emptyCount = 0;

    days.forEach((day) => {
      const dayKey = day.format("DD");
      let workCount = 0;

      staffIds.forEach((staffId) => {
        const cell = state.shiftDataMap.get(staffId)?.get(dayKey);
        if (cell?.state === "work") workCount++;
      });

      if (day.date() <= 10) {
        confirmedCount++;
      } else if (workCount < 2) {
        needsAdjustmentCount++;
      } else if (workCount === 0) {
        emptyCount++;
      }
    });

    const totalDays = days.length;
    const confirmedPercent = (confirmedCount / totalDays) * 100;
    const adjustmentPercent = (needsAdjustmentCount / totalDays) * 100;

    return {
      confirmedCount,
      confirmedPercent,
      needsAdjustmentCount,
      adjustmentPercent,
      emptyCount,
    };
  }, [days, staffIds, state.shiftDataMap]);

  /**
   * 日ごとの人数集計
   */
  const calculateDailyCount = (
    dayKey: string
  ): { work: number; fixedOff: number; requestedOff: number } => {
    let work = 0;
    let fixedOff = 0;
    let requestedOff = 0;

    staffIds.forEach((staffId) => {
      const cell = state.shiftDataMap.get(staffId)?.get(dayKey);
      if (cell) {
        if (cell.state === "work") work++;
        else if (cell.state === "fixedOff") fixedOff++;
        else if (cell.state === "requestedOff") requestedOff++;
      }
    });

    return { work, fixedOff, requestedOff };
  };

  return (
    <Page title="協同シフト調整">
      <Container maxWidth={false} sx={{ py: 3 }} onMouseUp={handleMouseUp}>
        {/* ヘッダー */}
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <Typography variant="h4">協同シフト調整</Typography>
          <Chip
            label={currentMonth.format("YYYY年 M月")}
            color="primary"
            variant="outlined"
          />

          {/* アクティブユーザー表示 */}
          <Box sx={{ flex: 1 }} />
          <AvatarGroup max={5}>
            {state.activeUsers.map((user) => (
              <Tooltip key={user.userId} title={user.userName}>
                <Avatar
                  sx={{
                    bgcolor: user.color,
                    width: 32,
                    height: 32,
                    fontSize: "0.875rem",
                  }}
                >
                  {user.userName.charAt(0)}
                </Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>

          {/* 同期ボタン */}
          <Tooltip
            title={
              state.lastSyncedAt
                ? `最終同期: ${dayjs(state.lastSyncedAt).format("HH:mm:ss")}`
                : "同期"
            }
          >
            <IconButton
              onClick={handleSync}
              disabled={state.isSyncing}
              size="small"
            >
              <SyncIcon
                sx={{
                  animation: state.isSyncing ? "spin 1s linear infinite" : "",
                  "@keyframes spin": {
                    from: { transform: "rotate(0deg)" },
                    to: { transform: "rotate(360deg)" },
                  },
                }}
              />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* エラー表示 */}
        {state.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {state.error}
          </Alert>
        )}

        {/* 進捗表示 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                調整状況
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress.confirmedPercent}
                sx={{ height: 8, borderRadius: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                確定: {progress.confirmedCount} / {days.length}日 (
                {progress.confirmedPercent.toFixed(0)}%)
              </Typography>
            </Box>

            {progress.needsAdjustmentCount > 0 && (
              <Alert severity="warning" icon={<InfoIcon />}>
                調整が必要な日: {progress.needsAdjustmentCount}日
              </Alert>
            )}
          </Stack>
        </Paper>

        {/* シフト表 */}
        <TableContainer component={Paper}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    position: "sticky",
                    left: 0,
                    zIndex: 3,
                    bgcolor: "background.paper",
                  }}
                >
                  スタッフ名
                </TableCell>
                {days.map((day) => {
                  const dayKey = day.format("DD");
                  const count = calculateDailyCount(dayKey);
                  const isWeekend = day.day() === 0 || day.day() === 6;

                  return (
                    <TableCell
                      key={dayKey}
                      align="center"
                      sx={{
                        bgcolor: isWeekend
                          ? alpha("#f44336", 0.05)
                          : "background.paper",
                        minWidth: 50,
                      }}
                    >
                      <Typography variant="caption" display="block">
                        {day.format("M/D")}
                      </Typography>
                      <Typography variant="caption" display="block">
                        ({day.format("ddd")})
                      </Typography>
                      <Typography
                        variant="caption"
                        color={
                          count.work < 2 ? "warning.main" : "text.secondary"
                        }
                      >
                        {count.work}人
                      </Typography>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {state.isLoading ? (
                <TableRow>
                  <TableCell colSpan={days.length + 1} align="center">
                    読み込み中...
                  </TableCell>
                </TableRow>
              ) : (
                staffIds.map((staffId) => {
                  const staffData = state.shiftDataMap.get(staffId);
                  if (!staffData) return null;

                  return (
                    <TableRow key={staffId}>
                      <TableCell
                        sx={{
                          position: "sticky",
                          left: 0,
                          zIndex: 2,
                          bgcolor: "background.paper",
                          fontWeight: 600,
                        }}
                      >
                        {staffId}
                      </TableCell>
                      {days.map((day) => {
                        const dayKey = day.format("DD");
                        const cell = staffData.get(dayKey);
                        if (!cell) return <TableCell key={dayKey}>-</TableCell>;

                        const isEditing = isCellBeingEdited(staffId, dayKey);
                        const editor = getCellEditor(staffId, dayKey);
                        const isFocused =
                          focusedCell?.staffId === staffId &&
                          focusedCell?.date === dayKey;
                        const isSelected = isCellSelected(staffId, dayKey);

                        return (
                          <ShiftCell
                            key={dayKey}
                            state={cell.state}
                            isLocked={cell.isLocked}
                            isEditing={isEditing}
                            editorName={editor?.userName}
                            lastChangedBy={cell.lastChangedBy}
                            lastChangedAt={cell.lastChangedAt}
                            onClick={(event) =>
                              handleCellClick(staffId, dayKey, event)
                            }
                            onRegisterRef={(element) =>
                              registerCell(staffId, dayKey, element)
                            }
                            onMouseDown={(event) =>
                              handleCellMouseDown(staffId, dayKey, event)
                            }
                            onMouseEnter={() =>
                              handleCellMouseEnter(staffId, dayKey)
                            }
                            isFocused={isFocused}
                            isSelected={isSelected}
                          />
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* バッチ編集ツールバー */}
        <BatchEditToolbar
          selectionCount={selectionCount}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onClear={clearSelection}
          onChangeState={handleChangeState}
          hasClipboard={hasClipboard}
          canPaste={focusedCell !== null}
        />

        {/* ヘルプボタン（FAB） */}
        <Fab
          color="primary"
          size="medium"
          onClick={() => setShowHelp(true)}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
          }}
        >
          <HelpOutlineIcon />
        </Fab>

        {/* ヘルプダイアログ */}
        <KeyboardShortcutsHelp
          open={showHelp}
          onClose={() => setShowHelp(false)}
        />
      </Container>
    </Page>
  );
};

/**
 * エクスポート用コンポーネント（Providerでラップ）
 */
export default function ShiftCollaborativePage() {
  // TODO: 実際のプロップスをルートパラメータやContextから取得
  const staffIds = ["staff001", "staff002", "staff003", "staff004", "staff005"];
  const targetMonth = dayjs().format("YYYY-MM");
  const currentUserId = "current-user-id";
  const currentUserName = "Current User";
  const shiftRequestId = "shift-request-id";

  return (
    <CollaborativeShiftProvider
      staffIds={staffIds}
      targetMonth={targetMonth}
      currentUserId={currentUserId}
      currentUserName={currentUserName}
      shiftRequestId={shiftRequestId}
    >
      <ShiftCollaborativePageInner />
    </CollaborativeShiftProvider>
  );
}
