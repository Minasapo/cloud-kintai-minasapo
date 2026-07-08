import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { Box, Divider, Stack, Typography } from "@mui/material";
import { AppButton } from "@shared/ui/button";
import AppDialog from "@shared/ui/feedback/AppDialog";
import { memo, useState } from "react";

import { useShiftCellPanelState } from "../hooks/useShiftCellPanelState";
import { CHAT_SYSTEM_MESSAGE_PREFIX } from "../lib/chatSystemMessages";
import { CellComment, Mention, ShiftState } from "../types/collaborative.types";
import {
  CellCommentsSection,
  CellEditLockSection,
  CellStateButtons,
} from "./shift-cell-panel/ShiftCellPanelSections";
import { InfoBadge } from "./ui/Badges";
import { InlineAlert } from "./ui/InlineAlert";

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
  editLockError: string | null;
  onClearEditLockError: () => void;
  onAcquireEditLock: () => Promise<boolean>;
  onReleaseEditLock: () => Promise<boolean>;
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
  editLockError,
  onClearEditLockError,
  onAcquireEditLock,
  onReleaseEditLock,
  onForceReleaseLock,
}: ShiftCellPanelProps) => {
  const showCommentsPanel = Boolean(onAddComments) && selectedCells.length > 0;
  const [isLockActionPending, setIsLockActionPending] = useState(false);
  const isBusy = isUpdating || isLockActionPending;

  const { commentText, isAddingComment, setCommentText, handleAddComment } =
    useShiftCellPanelState({
      onAddComments,
    });

  const runLockAction = async (action: () => Promise<void>) => {
    setIsLockActionPending(true);
    try {
      await action();
    } finally {
      setIsLockActionPending(false);
    }
  };

  const handleAcquireEditLock = async () => {
    await runLockAction(async () => {
      const acquired = await onAcquireEditLock();
      if (!acquired || !onAddComments) {
        return;
      }

      await onAddComments(
        `${CHAT_SYSTEM_MESSAGE_PREFIX}${currentUserName}が編集ロックを取得しました`,
        [],
      );
    });
  };

  const handleReleaseEditLock = async () => {
    await runLockAction(async () => {
      const released = await onReleaseEditLock();
      if (!released || !onAddComments) {
        return;
      }

      await onAddComments(
        `${CHAT_SYSTEM_MESSAGE_PREFIX}${currentUserName}が編集ロックを解除しました`,
        [],
      );
    });
  };

  const handleForceReleaseLock = async () => {
    await runLockAction(async () => {
      await onForceReleaseLock();
    });
  };

  if (selectionCount === 0) return null;

  return (
    <AppDialog
      open={selectionCount > 0}
      onClose={onClear}
      maxWidth="lg"
      fullWidth
      loading={isBusy}
      title={
        <Stack direction="row" spacing={1} alignItems="center">
          <CheckIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={600} component="span">
            {selectionCount}セル選択中
          </Typography>
        </Stack>
      }
      actions={
        <AppButton
          variant="ghost"
          tone="neutral"
          size="sm"
          onClick={onClear}
          startIcon={<CloseIcon />}
          disabled={isUpdating}
        >
          閉じる
        </AppButton>
      }
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems="stretch"
      >
        <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
          {editLockError && (
            <InlineAlert
              tone="warning"
              icon={<InfoBadge />}
              onClose={onClearEditLockError}
            >
              {editLockError}
            </InlineAlert>
          )}

          <CellEditLockSection
            hasEditLockForSelected={hasEditLockForSelected}
            isOthersEditingSelected={isOthersEditingSelected}
            canUnlock={canUnlock}
            isUpdating={isBusy}
            onAcquireEditLock={handleAcquireEditLock}
            onReleaseEditLock={handleReleaseEditLock}
            onForceReleaseLock={handleForceReleaseLock}
          />

          <Divider />

          <CellStateButtons
            isUpdating={isBusy}
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
    </AppDialog>
  );
};

export const ShiftCellPanel = memo(ShiftCellPanelBase);
