import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MessageIcon from "@mui/icons-material/Message";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { AppButton } from "@shared/ui/button";
import { AppTextField } from "@shared/ui/form";
import dayjs from "dayjs";

import {
  CELL_CHANGE_SOURCE_COLORS,
  CELL_CHANGE_SOURCE_LABELS,
} from "../../lib/cellChangeSourceConfig";
import {
  CellChangeRecord,
  CellComment,
  Mention,
  ShiftState,
} from "../../types/collaborative.types";

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
        >
          編集開始（ロック取得）
        </AppButton>
      )}
      {hasEditLockForSelected && (
        <AppButton
          variant="outline"
          size="sm"
          onClick={onReleaseEditLock}
          disabled={isUpdating}
        >
          編集終了（ロック解除）
        </AppButton>
      )}
      {(hasEditLockForSelected || isOthersEditingSelected) && canUnlock && (
        <AppButton
          variant="solid"
          tone="danger"
          size="sm"
          onClick={onForceReleaseLock}
          disabled={isUpdating}
        >
          編集ロックを強制剥奪
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
    <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
      {stateOptions.map((option) => (
        <Chip
          key={option.state}
          label={option.label}
          onClick={() => onChangeState(option.state)}
          disabled={isUpdating || !hasEditLockForSelected}
          sx={{
            bgcolor: option.color,
            color: "white",
            fontWeight: 600,
            "&:hover": {
              bgcolor: option.color,
              opacity: isUpdating ? 0.5 : 0.8,
            },
          }}
        />
      ))}
    </Stack>
  </Box>
);

interface CellCommentsSectionProps {
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

  return (
    <>
      <Box>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          コメント追加:
        </Typography>
        <Stack direction="row" spacing={1} mt={1}>
          <AppTextField
            placeholder="選択セルにコメントを追加..."
            size="small"
            fullWidth
            value={commentText}
            onChange={(e) => onCommentTextChange(e.target.value)}
            disabled={isAddingComment || isUpdating}
            multiline
            maxRows={2}
            sx={{ flexGrow: 1 }}
          />
          <AppButton
            variant="solid"
            startIcon={
              isAddingComment ? <CircularProgress size={16} /> : <MessageIcon />
            }
            onClick={onAddComment}
            disabled={!commentText.trim() || isAddingComment || isUpdating}
            size="sm"
            sx={{ whiteSpace: "nowrap" }}
          >
            追加
          </AppButton>
        </Stack>
      </Box>

      {comments.length > 0 && (
        <Box
          sx={{
            bgcolor: "background.default",
            borderRadius: 1,
            p: 2,
            maxHeight: 200,
            overflowY: "auto",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mb={1}
          >
            {comments.length}件のコメント
          </Typography>
          <Stack spacing={1.5}>
            {comments.map((comment, index) => (
              <Box
                key={`${comment.id}-${comment.createdAt}-${index}`}
                sx={{ display: "flex", gap: 1 }}
              >
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
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" fontWeight={600}>
                      {comment.userName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(comment.createdAt).format("HH:mm")}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      wordBreak: "break-word",
                      mt: 0.5,
                    }}
                  >
                    {comment.content}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      <Divider />
    </>
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
