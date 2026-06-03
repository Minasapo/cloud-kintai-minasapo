import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { AppButton } from "@shared/ui/button";
import { memo } from "react";

import { useShiftCellPanelState } from "../hooks/useShiftCellPanelState";
import {
  CellChangeRecord,
  CellComment,
  Mention,
  ShiftState,
} from "../types/collaborative.types";
import {
  CellCommentsSection,
  CellEditLockSection,
  CellHistorySection,
  CellStateButtons,
  EditLockHolder,
} from "./shift-cell-panel/ShiftCellPanelSections";

interface ShiftCellPanelProps {
  selectionCount: number;
  selectedCells?: Array<{ staffId: string; date: string }>;
  comments?: CellComment[];
  cellHistory?: readonly CellChangeRecord[];
  onClear: () => void;
  onChangeState: (state: ShiftState) => void;
  onLock: () => void;
  onUnlock: () => void;
  onAddComments?: (content: string, mentions: Mention[]) => Promise<void>;
  canUnlock: boolean;
  showLock: boolean;
  showUnlock: boolean;
  isUpdating?: boolean;
  cellEditLockHolders?: EditLockHolder[];
  hasEditLockForSelected: boolean;
  isOthersEditingSelected: boolean;
  onAcquireEditLock: () => void;
  onReleaseEditLock: () => void;
  onForceReleaseLock: () => void;
}

const MAX_HISTORY_VISIBLE = 5;

const ShiftCellPanelBase = ({
  selectionCount,
  selectedCells = [],
  comments = [],
  cellHistory = [],
  onClear,
  onChangeState,
  onLock,
  onUnlock,
  onAddComments,
  canUnlock,
  showLock,
  showUnlock,
  isUpdating = false,
  cellEditLockHolders = [],
  hasEditLockForSelected,
  isOthersEditingSelected,
  onAcquireEditLock,
  onReleaseEditLock,
  onForceReleaseLock,
}: ShiftCellPanelProps) => {
  const {
    commentText,
    isAddingComment,
    historyExpanded,
    setCommentText,
    setHistoryExpanded,
    handleAddComment,
  } = useShiftCellPanelState({
    cellHistoryLength: cellHistory.length,
    onAddComments,
  });

  if (selectionCount === 0) return null;

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        px: 3,
        py: 2,
        borderRadius: "24px",
        border: "1px solid rgba(226,232,240,0.9)",
        minWidth: 600,
        zIndex: 1000,
        opacity: isUpdating ? 0.6 : 1,
        pointerEvents: isUpdating ? "none" : "auto",
        bgcolor: "rgb(255 255 255)",
        boxShadow: "0 28px 60px -36px rgba(15,23,42,0.4)",
      }}
    >
      <Stack spacing={2}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>
              {selectionCount}セル選択中
            </Typography>
          </Stack>
          <AppButton
            variant="ghost"
            tone="neutral"
            size="sm"
            onClick={onClear}
            startIcon={<DeleteIcon />}
            disabled={isUpdating}
          >
            選択解除
          </AppButton>
        </Box>

        <Divider />

        <CellEditLockSection
          cellEditLockHolders={cellEditLockHolders}
          hasEditLockForSelected={hasEditLockForSelected}
          isOthersEditingSelected={isOthersEditingSelected}
          canUnlock={canUnlock}
          isUpdating={isUpdating}
          onAcquireEditLock={onAcquireEditLock}
          onReleaseEditLock={onReleaseEditLock}
          onForceReleaseLock={onForceReleaseLock}
        />

        <Divider />

        <CellStateButtons
          isUpdating={isUpdating}
          hasEditLockForSelected={hasEditLockForSelected}
          onChangeState={onChangeState}
        />

        <Divider />

        <Stack direction="row" spacing={1}>
          {showLock && (
            <AppButton
              variant="solid"
              startIcon={<LockIcon />}
              onClick={onLock}
              size="sm"
              disabled={isUpdating}
            >
              確定（ロック）
            </AppButton>
          )}
          {showUnlock && (
            <AppButton
              variant="outline"
              startIcon={<LockOpenIcon />}
              onClick={onUnlock}
              tone="neutral"
              size="sm"
              disabled={!canUnlock || isUpdating}
            >
              確定解除
            </AppButton>
          )}
        </Stack>

        <Divider />

        <CellCommentsSection
          selectedCells={selectedCells}
          comments={comments}
          onAddComments={onAddComments}
          isUpdating={isUpdating}
          commentText={commentText}
          onCommentTextChange={setCommentText}
          onAddComment={handleAddComment}
          isAddingComment={isAddingComment}
        />

        <CellHistorySection
          selectionCount={selectionCount}
          selectedCells={selectedCells}
          cellHistory={cellHistory}
          historyExpanded={historyExpanded}
          onToggleExpand={() => setHistoryExpanded((v) => !v)}
          maxVisible={MAX_HISTORY_VISIBLE}
        />

        <Typography variant="caption" color="text.secondary">
          <strong>ヒント:</strong>{" "}
          Shift+クリックで範囲選択、Ctrl/Cmd+クリックで個別追加選択
        </Typography>
      </Stack>
    </Paper>
  );
};

export const ShiftCellPanel = memo(ShiftCellPanelBase);
