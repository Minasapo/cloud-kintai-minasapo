import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { AppButton } from "@shared/ui/button";
import { memo } from "react";

import { useShiftCellPanelState } from "../hooks/useShiftCellPanelState";
import { CHAT_SYSTEM_MESSAGE_PREFIX } from "../lib/chatSystemMessages";
import { CellComment, Mention, ShiftState } from "../types/collaborative.types";
import {
  CellCommentsSection,
  CellEditLockSection,
  CellStateButtons,
} from "./shift-cell-panel/ShiftCellPanelSections";

interface ShiftCellPanelProps {
  currentUserId: string;
  currentUserName: string;
  selectionCount: number;
  selectedCells?: Array<{ staffId: string; date: string }>;
  comments?: CellComment[];
  onClear: () => void;
  onChangeState: (state: ShiftState) => void;
  onLock: () => void;
  onUnlock: () => void;
  onAddComments?: (content: string, mentions: Mention[]) => Promise<void>;
  canUnlock: boolean;
  showLock: boolean;
  showUnlock: boolean;
  isUpdating?: boolean;
  hasEditLockForSelected: boolean;
  isOthersEditingSelected: boolean;
  onAcquireEditLock: () => void;
  onReleaseEditLock: () => void;
  onForceReleaseLock: () => void;
}

const ShiftCellPanelBase = ({
  currentUserId,
  currentUserName,
  selectionCount,
  selectedCells = [],
  comments = [],
  onClear,
  onChangeState,
  onLock,
  onUnlock,
  onAddComments,
  canUnlock,
  showLock,
  showUnlock,
  isUpdating = false,
  hasEditLockForSelected,
  isOthersEditingSelected,
  onAcquireEditLock,
  onReleaseEditLock,
  onForceReleaseLock,
}: ShiftCellPanelProps) => {
  const showCommentsPanel = Boolean(onAddComments) && selectedCells.length > 0;

  const { commentText, isAddingComment, setCommentText, handleAddComment } =
    useShiftCellPanelState({
      onAddComments,
    });

  const handleAcquireEditLock = () => {
    onAcquireEditLock();
    if (!onAddComments) {
      return;
    }

    void onAddComments(
      `${CHAT_SYSTEM_MESSAGE_PREFIX}${currentUserName}が編集ロックを取得しました`,
      [],
    );
  };

  const handleReleaseEditLock = () => {
    onReleaseEditLock();
    if (!onAddComments) {
      return;
    }

    void onAddComments(
      `${CHAT_SYSTEM_MESSAGE_PREFIX}${currentUserName}が編集ロックを解除しました`,
      [],
    );
  };

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
        width: "min(1080px, calc(100vw - 32px))",
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

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="stretch"
        >
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <CellEditLockSection
              hasEditLockForSelected={hasEditLockForSelected}
              isOthersEditingSelected={isOthersEditingSelected}
              canUnlock={canUnlock}
              isUpdating={isUpdating}
              onAcquireEditLock={handleAcquireEditLock}
              onReleaseEditLock={handleReleaseEditLock}
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

            <Typography variant="caption" color="text.secondary">
              <strong>ヒント:</strong>{" "}
              Shift+クリックで範囲選択、Ctrl/Cmd+クリックで個別追加選択
            </Typography>
          </Stack>

          {showCommentsPanel && (
            <Box
              sx={{
                flex: { xs: 1, md: "0 0 420px" },
                width: { xs: "100%", md: 420 },
                minHeight: 0,
                pl: { xs: 0, md: 2 },
                borderLeft: { xs: "none", md: "1px solid" },
                borderColor: "divider",
              }}
            >
              <CellCommentsSection
                currentUserId={currentUserId}
                selectedCells={selectedCells}
                comments={comments}
                onAddComments={onAddComments}
                isUpdating={isUpdating}
                commentText={commentText}
                onCommentTextChange={setCommentText}
                onAddComment={handleAddComment}
                isAddingComment={isAddingComment}
              />
            </Box>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

export const ShiftCellPanel = memo(ShiftCellPanelBase);
