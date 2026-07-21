import "dayjs/locale/ja";

import SendRoundedIcon from "@mui/icons-material/SendRounded";
import {
  Box,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { AppAvatar } from "@shared/ui/avatar";
import { AppButton, AppIconButton } from "@shared/ui/button";
import { AppTextField } from "@shared/ui/form";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useRef, useState } from "react";

import { CHAT_SYSTEM_MESSAGE_PREFIX } from "../../lib/chatSystemMessages";
import {
  CellComment,
  Mention,
  ShiftState,
} from "../../types/collaborative.types";

dayjs.extend(relativeTime);
dayjs.locale("ja");

export interface EditLockHolder {
  staffId: string;
  date: string;
  editorName: string;
  editorColor: string;
  isSelf: boolean;
}

const formatCommentRelativeTime = (createdAt: string | number) => {
  const created = dayjs(createdAt);
  const diffSeconds = dayjs().diff(created, "second");

  if (diffSeconds <= 0) {
    return "今";
  }

  if (diffSeconds < 60) {
    return `${diffSeconds}秒前`;
  }

  return created.fromNow();
};

const stateOptions: Array<{ state: ShiftState; label: string; color: string }> =
  [
    { state: "work", label: "出勤", color: "rgb(76 175 80)" },
    { state: "requestedOff", label: "希望休", color: "rgb(255 152 0)" },
    { state: "fixedOff", label: "固定休", color: "rgb(244 67 54)" },
    { state: "auto", label: "自動調整", color: "rgb(33 150 243)" },
    { state: "empty", label: "未入力", color: "rgb(158 158 158)" },
  ];

interface CellAcquireEditLockSectionProps {
  hasEditLockForSelected: boolean;
  isOthersEditingSelected: boolean;
  isUpdating: boolean;
  onAcquireEditLock: () => Promise<void>;
}

export const CellAcquireEditLockSection = ({
  hasEditLockForSelected,
  isOthersEditingSelected,
  isUpdating,
  onAcquireEditLock,
}: CellAcquireEditLockSectionProps) => {
  const isAcquireLoading =
    isUpdating && !hasEditLockForSelected && !isOthersEditingSelected;

  return (
    <Box>
      <Stack direction="row" spacing={1}>
        <AppButton
          variant="solid"
          size="sm"
          onClick={onAcquireEditLock}
          disabled={
            isUpdating || hasEditLockForSelected || isOthersEditingSelected
          }
          loading={isAcquireLoading}
        >
          {isAcquireLoading ? "処理中..." : "編集開始（ロック取得）"}
        </AppButton>
        {isOthersEditingSelected && (
          <Typography
            variant="body2"
            color="error"
            sx={{ alignSelf: "center" }}
          >
            他のユーザーが編集中です
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

interface CellReleaseLockSectionProps {
  hasEditLockForSelected: boolean;
  canUnlock: boolean;
  isOthersEditingSelected: boolean;
  isUpdating: boolean;
  onReleaseEditLock: () => Promise<void>;
}

export const CellReleaseLockSection = ({
  hasEditLockForSelected,
  canUnlock,
  isOthersEditingSelected,
  isUpdating,
  onReleaseEditLock,
}: CellReleaseLockSectionProps) => {
  const isReleaseLoading = isUpdating && hasEditLockForSelected;

  return (
    <Box>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <AppButton
            variant="outline"
            size="sm"
            onClick={onReleaseEditLock}
            disabled={isUpdating || !hasEditLockForSelected}
            loading={isReleaseLoading}
          >
            {isReleaseLoading ? "処理中..." : "編集終了（ロック解除）"}
          </AppButton>
          {isOthersEditingSelected && !canUnlock && (
            <Typography
              variant="body2"
              color="error"
              sx={{ alignSelf: "center" }}
            >
              他のユーザーが編集中です
            </Typography>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

interface CellStateButtonsProps {
  isUpdating: boolean;
  hasEditLockForSelected: boolean;
  onChangeState: (state: ShiftState) => void;
  currentState?: ShiftState | null;
  showTitle?: boolean;
}

export const CellStateButtons = ({
  isUpdating,
  hasEditLockForSelected,
  onChangeState,
  currentState = null,
  showTitle = true,
}: CellStateButtonsProps) => {
  const [selectedState, setSelectedState] = useState<ShiftState | null>(
    currentState,
  );

  useEffect(() => {
    setSelectedState(currentState);
  }, [currentState]);

  return (
    <Box>
      {showTitle && (
        <Typography variant="caption" color="text.secondary" gutterBottom>
          状態を変更:
        </Typography>
      )}
      <ToggleButtonGroup
        value={selectedState}
        size="small"
        exclusive
        onChange={(_, value: ShiftState | null) => {
          if (!value) {
            return;
          }

          setSelectedState(value);
          onChangeState(value);
        }}
        disabled={isUpdating || !hasEditLockForSelected}
      >
        {stateOptions.map((option) => (
          <ToggleButton
            key={option.state}
            value={option.state}
            sx={{
              color: option.color,
              borderColor: option.color,
              "&.Mui-selected, &.Mui-selected:hover": {
                color: "common.white",
                bgcolor: option.color,
                borderColor: option.color,
              },
            }}
          >
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

interface CellCommentsSectionProps {
  currentUserId: string;
  selectedCells: Array<{ staffId: string; date: string }>;
  comments: CellComment[];
  onAddComments?: (content: string, mentions: Mention[]) => Promise<void>;
  isUpdating: boolean;
  commentText: string;
  onCommentTextChange: (value: string) => void;
  onAddComment: () => void;
  isAddingComment: boolean;
}

export const CellCommentsSection = ({
  currentUserId,
  selectedCells,
  comments,
  onAddComments,
  isUpdating,
  commentText,
  onCommentTextChange,
  onAddComment,
  isAddingComment,
}: CellCommentsSectionProps) => {
  const timelineContainerRef = useRef<HTMLDivElement | null>(null);

  const timelineItems = comments
    .map((comment, index) => ({
      key: `comment-${comment.id}-${comment.createdAt}-${index}`,
      createdAt: dayjs(comment.createdAt).valueOf(),
      comment,
    }))
    .sort((a, b) => {
      if (a.createdAt !== b.createdAt) {
        return a.createdAt - b.createdAt;
      }

      return a.key.localeCompare(b.key);
    });

  useEffect(() => {
    const container = timelineContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [selectedCells, timelineItems]);

  if (!onAddComments || selectedCells.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
      }}
    >
      <Box
        ref={timelineContainerRef}
        sx={{
          ml: "auto",
          width: "100%",
          maxWidth: 560,
          bgcolor: "background.default",
          borderRadius: 2,
          p: 1.5,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overscrollBehavior: "contain",
          border: "1px solid",
          borderColor: "divider",
          mb: 1,
        }}
      >
        {timelineItems.length > 0 && (
          <Stack spacing={1.25}>
            {timelineItems.map((item) => {
              const { comment } = item;
              const isSystemMessage = comment.content.startsWith(
                CHAT_SYSTEM_MESSAGE_PREFIX,
              );

              if (isSystemMessage) {
                const systemText = comment.content.slice(
                  CHAT_SYSTEM_MESSAGE_PREFIX.length,
                );

                return (
                  <Box
                    key={item.key}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <Stack spacing={0} alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {systemText}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {formatCommentRelativeTime(comment.createdAt)}
                      </Typography>
                    </Stack>
                  </Box>
                );
              }

              const isOwnMessage = comment.userId === currentUserId;

              return (
                <Stack
                  key={item.key}
                  direction="row"
                  spacing={1}
                  justifyContent={isOwnMessage ? "flex-end" : "flex-start"}
                  alignItems="flex-end"
                >
                  {!isOwnMessage && (
                    <AppAvatar
                      sx={{
                        width: 28,
                        height: 28,
                        fontSize: "0.75rem",
                        bgcolor: `hsl(${Math.abs(comment.userId.charCodeAt(0) * 131) % 360}, 70%, 50%)`,
                      }}
                    >
                      {comment.userName?.charAt(0).toUpperCase()}
                    </AppAvatar>
                  )}
                  <Stack spacing={0.25} sx={{ maxWidth: "80%", minWidth: 120 }}>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 1,
                        borderRadius: isOwnMessage
                          ? "16px 16px 4px 16px"
                          : "16px 16px 16px 4px",
                        bgcolor: isOwnMessage
                          ? "primary.light"
                          : "action.hover",
                        border: "1px solid",
                        borderColor: isOwnMessage ? "primary.main" : "divider",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          wordBreak: "break-word",
                          color: isOwnMessage
                            ? "primary.contrastText"
                            : "text.primary",
                        }}
                      >
                        {comment.content}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        textAlign: isOwnMessage ? "right" : "left",
                        pr: isOwnMessage ? 0.5 : 0,
                        pl: isOwnMessage ? 0 : 0.5,
                      }}
                    >
                      {formatCommentRelativeTime(comment.createdAt)}
                    </Typography>
                  </Stack>
                  {isOwnMessage && (
                    <AppAvatar
                      sx={{
                        width: 28,
                        height: 28,
                        fontSize: "0.75rem",
                        bgcolor: `hsl(${Math.abs(comment.userId.charCodeAt(0) * 131) % 360}, 70%, 50%)`,
                      }}
                    >
                      {comment.userName?.charAt(0).toUpperCase()}
                    </AppAvatar>
                  )}
                </Stack>
              );
            })}
          </Stack>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "stretch",
          mt: 1,
          minWidth: 0,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: "100%", minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              minHeight: 52,
              minWidth: 0,
              px: 1,
              py: 0.75,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 999,
              bgcolor: "background.paper",
              flexWrap: "nowrap",
            }}
          >
            <AppTextField
              placeholder="選択セルにコメントを追加..."
              size="small"
              fullWidth
              value={commentText}
              onChange={(e) => onCommentTextChange(e.target.value)}
              disabled={isAddingComment || isUpdating}
              multiline
              maxRows={2}
              sx={{
                flexGrow: 1,
                minWidth: 0,
                "& .MuiOutlinedInput-root": {
                  px: 0,
                  py: 0,
                  bgcolor: "transparent",
                  "& fieldset": {
                    border: "none",
                  },
                  "&:hover fieldset": {
                    border: "none",
                  },
                  "&.Mui-focused fieldset": {
                    border: "none",
                  },
                },
                "& .MuiInputBase-inputMultiline": {
                  py: 0.75,
                  px: 0.5,
                },
              }}
            />
            <AppIconButton
              aria-label="コメントを送信"
              tone="primary"
              size="sm"
              loading={isAddingComment}
              onClick={onAddComment}
              disabled={!commentText.trim() || isAddingComment || isUpdating}
              className="shrink-0"
            >
              <SendRoundedIcon fontSize="small" />
            </AppIconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
