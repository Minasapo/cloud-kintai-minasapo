import "dayjs/locale/ja";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import {
  Avatar,
  Box,
  Chip,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { AppButton, AppIconButton } from "@shared/ui/button";
import { AppTextField } from "@shared/ui/form";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import {
  CELL_CHANGE_SOURCE_COLORS,
  CELL_CHANGE_SOURCE_LABELS,
} from "../../lib/cellChangeSourceConfig";
import { CHAT_SYSTEM_MESSAGE_PREFIX } from "../../lib/chatSystemMessages";
import {
  CellChangeRecord,
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

const SHIFT_STATE_LABELS: Record<ShiftState, string> = {
  work: "出勤",
  fixedOff: "固定休",
  requestedOff: "希望休",
  auto: "自動調整枠",
  empty: "未入力",
};

const formatShiftState = (state?: ShiftState) =>
  state ? SHIFT_STATE_LABELS[state] : "未設定";

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

interface CellEditLockSectionProps {
  cellEditLockHolders: EditLockHolder[];
  hasEditLockForSelected: boolean;
  isOthersEditingSelected: boolean;
  canUnlock: boolean;
  isUpdating: boolean;
  onAcquireEditLock: () => void;
  onReleaseEditLock: () => void;
  onForceReleaseLock: () => void;
}

export const CellEditLockSection = ({
  cellEditLockHolders,
  hasEditLockForSelected,
  isOthersEditingSelected,
  canUnlock,
  isUpdating,
  onAcquireEditLock,
  onReleaseEditLock,
  onForceReleaseLock,
}: CellEditLockSectionProps) => (
  <Box>
    <Stack direction="row" spacing={1}>
      {!hasEditLockForSelected && !isOthersEditingSelected && (
        <AppButton
          variant="solid"
          size="sm"
          onClick={onAcquireEditLock}
          disabled={isUpdating}
          loading={isUpdating}
        >
          {isUpdating ? "処理中..." : "編集開始（ロック取得）"}
        </AppButton>
      )}
      {hasEditLockForSelected && (
        <AppButton
          variant="outline"
          size="sm"
          onClick={onReleaseEditLock}
          disabled={isUpdating}
          loading={isUpdating}
        >
          {isUpdating ? "処理中..." : "編集終了（ロック解除）"}
        </AppButton>
      )}
      {(hasEditLockForSelected || isOthersEditingSelected) && canUnlock && (
        <AppButton
          variant="solid"
          tone="danger"
          size="sm"
          onClick={onForceReleaseLock}
          disabled={isUpdating}
          loading={isUpdating}
        >
          {isUpdating ? "処理中..." : "編集ロックを強制剥奪"}
        </AppButton>
      )}
      {isOthersEditingSelected && !canUnlock && (
        <Typography variant="body2" color="error" sx={{ alignSelf: "center" }}>
          他のユーザーが編集中です
        </Typography>
      )}
    </Stack>

    {cellEditLockHolders.length > 0 && (
      <Stack spacing={0.5} sx={{ mt: 1 }}>
        {cellEditLockHolders.map(
          ({ staffId, date, editorName, editorColor, isSelf }) => (
            <Stack
              key={`${staffId}#${date}`}
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <Avatar
                sx={{
                  width: 20,
                  height: 20,
                  fontSize: "0.65rem",
                  bgcolor: editorColor,
                }}
              >
                {editorName.charAt(0)}
              </Avatar>
              <Typography variant="caption" color="text.secondary">
                {date}日:
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {editorName}
              </Typography>
              {isSelf && (
                <Typography variant="caption" color="primary.main">
                  （あなた）
                </Typography>
              )}
              <Typography variant="caption" color="text.disabled">
                が編集ロック中
              </Typography>
            </Stack>
          ),
        )}
      </Stack>
    )}
  </Box>
);

interface CellStateButtonsProps {
  isUpdating: boolean;
  hasEditLockForSelected: boolean;
  onChangeState: (state: ShiftState) => void;
}

export const CellStateButtons = ({
  isUpdating,
  hasEditLockForSelected,
  onChangeState,
}: CellStateButtonsProps) => (
  <Box>
    <Typography variant="caption" color="text.secondary" gutterBottom>
      状態を一括変更:
    </Typography>
    <ToggleButtonGroup
      value={null}
      exclusive
      onChange={(_, value: ShiftState | null) => {
        if (value) {
          onChangeState(value);
        }
      }}
      disabled={isUpdating || !hasEditLockForSelected}
      sx={{
        mt: 1,
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        "& .MuiToggleButton-root": {
          border: 0,
          borderRadius: 999,
          color: "common.white",
          fontWeight: 600,
          px: 1.75,
          py: 0.5,
          "&:hover": {
            opacity: 0.85,
          },
          "&.Mui-disabled": {
            opacity: 0.45,
            color: "common.white",
          },
        },
      }}
    >
      {stateOptions.map((option) => (
        <ToggleButton
          key={option.state}
          value={option.state}
          sx={{
            bgcolor: option.color,
            "&.Mui-selected, &.Mui-selected:hover": {
              bgcolor: option.color,
            },
          }}
        >
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  </Box>
);

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
  if (!onAddComments || selectedCells.length === 0) {
    return null;
  }

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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      <Box
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
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        fontSize: "0.75rem",
                        bgcolor: `hsl(${Math.abs(comment.userId.charCodeAt(0) * 131) % 360}, 70%, 50%)`,
                      }}
                    >
                      {comment.userName?.charAt(0).toUpperCase()}
                    </Avatar>
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
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        fontSize: "0.75rem",
                        bgcolor: `hsl(${Math.abs(comment.userId.charCodeAt(0) * 131) % 360}, 70%, 50%)`,
                      }}
                    >
                      {comment.userName?.charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                </Stack>
              );
            })}
          </Stack>
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "auto" }}>
        <Box sx={{ width: "100%", maxWidth: 560 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              gap: 0.5,
              px: 1,
              py: 0.5,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 999,
              bgcolor: "background.paper",
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
            >
              <SendRoundedIcon fontSize="small" />
            </AppIconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

interface CellHistorySectionProps {
  selectionCount: number;
  selectedCells: Array<{ staffId: string; date: string }>;
  cellHistory: readonly CellChangeRecord[];
  historyExpanded: boolean;
  onToggleExpand: () => void;
  maxVisible: number;
}

export const CellHistorySection = ({
  selectionCount,
  selectedCells,
  cellHistory,
  historyExpanded,
  onToggleExpand,
  maxVisible,
}: CellHistorySectionProps) => {
  if (selectionCount !== 1 || selectedCells.length !== 1) return null;
  return (
    <>
      <Box>
        <AppButton
          size="sm"
          variant="ghost"
          tone="neutral"
          endIcon={historyExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={onToggleExpand}
          sx={{ px: 0, fontWeight: 600 }}
        >
          変更履歴
          {cellHistory.length > 0 ? `（${cellHistory.length}件）` : ""}
        </AppButton>
        <Collapse in={historyExpanded}>
          {cellHistory.length === 0 ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.5 }}
            >
              変更履歴はありません
            </Typography>
          ) : (
            <List dense disablePadding sx={{ mt: 0.5 }}>
              {cellHistory.slice(0, maxVisible).map((record) => (
                <ListItem key={record.id} disableGutters sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        flexWrap="wrap"
                      >
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(record.changedAt).format("M/D HH:mm")}
                        </Typography>
                        <Chip
                          size="small"
                          label={CELL_CHANGE_SOURCE_LABELS[record.source]}
                          color={CELL_CHANGE_SOURCE_COLORS[record.source]}
                          variant="outlined"
                          sx={{ height: 16, fontSize: "0.6rem" }}
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
                          {record.changedByName || "不明"}
                        </Typography>
                      </Stack>
                    }
                    secondaryTypographyProps={{ component: "div" }}
                  />
                </ListItem>
              ))}
              {cellHistory.length > maxVisible && (
                <Typography variant="caption" color="text.disabled">
                  他 {cellHistory.length - maxVisible} 件
                </Typography>
              )}
            </List>
          )}
        </Collapse>
      </Box>
      <Divider />
    </>
  );
};
