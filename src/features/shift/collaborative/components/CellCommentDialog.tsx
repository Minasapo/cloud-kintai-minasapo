import ReplyIcon from "@mui/icons-material/Reply";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AppDeleteIconButton,
  AppEditIconButton,
} from "@shared/ui/button/AppActionIconButton";
import React, { useCallback, useMemo, useState } from "react";

import { useShiftComments } from "../hooks/useShiftComments";
import { CellComment, Mention } from "../types/collaborative.types";

// ── Shared type alias ──────────────────────────────────────────────
type UserOption = { userId: string; userName: string };

// ── CellCommentDialogProps ─────────────────────────────────────────
interface CellCommentDialogProps {
  open: boolean;
  cellKey: string;
  staffName: string;
  date: string;
  comments: CellComment[];
  availableUsers: UserOption[];
  currentUserId: string;
  onClose: () => void;
  onAddComment: (cellKey: string, content: string, mentions: Mention[]) => void;
  onUpdateComment: (
    commentId: string,
    content: string,
    mentions: Mention[],
  ) => void;
  onDeleteComment: (commentId: string) => void;
  onReplyComment: (
    parentCommentId: string,
    content: string,
    mentions: Mention[],
  ) => void;
  onDeleteReply: (parentCommentId: string, replyId: string) => void;
}

// ── MentionAutocomplete ────────────────────────────────────────────
interface MentionAutocompleteProps {
  userNames: string[];
  value: UserOption[];
  availableUsers: UserOption[];
  onChange: (mentions: UserOption[]) => void;
}

const MentionAutocomplete: React.FC<MentionAutocompleteProps> = ({
  userNames,
  value,
  availableUsers,
  onChange,
}) => (
  <Autocomplete
    multiple
    options={userNames}
    value={value.map((m) => m.userName)}
    onChange={(_, newValues) => {
      const newMentions = newValues.map((name) => {
        const user = availableUsers.find((u) => u.userName === name);
        return user ?? { userId: "", userName: name };
      });
      onChange(newMentions);
    }}
    renderInput={(params) => (
      <TextField
        {...params}
        label="メンション"
        placeholder="メンションを選択"
        size="small"
        sx={{ mt: 1 }}
      />
    )}
    renderTags={(tagValue, getTagProps) =>
      tagValue.map((option, index) => (
        <Chip
          label={`@${option}`}
          {...getTagProps({ index })}
          key={option}
          size="small"
        />
      ))
    }
  />
);

// ── CommentEditForm ────────────────────────────────────────────────
interface CommentEditFormProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const CommentEditForm: React.FC<CommentEditFormProps> = ({
  content,
  onChange,
  onSave,
  onCancel,
}) => (
  <Box sx={{ mt: 1 }}>
    <TextField
      fullWidth
      multiline
      rows={3}
      value={content}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      variant="outlined"
    />
    <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
      <Button size="small" variant="contained" onClick={onSave}>
        保存
      </Button>
      <Button size="small" variant="outlined" onClick={onCancel}>
        キャンセル
      </Button>
    </Box>
  </Box>
);

// ── ReplyItem ──────────────────────────────────────────────────────
interface ReplyItemProps {
  reply: CellComment;
  currentUserId: string;
  parentCommentId: string;
  onDeleteReply: (parentCommentId: string, replyId: string) => void;
}

const ReplyItem: React.FC<ReplyItemProps> = ({
  reply,
  currentUserId,
  parentCommentId,
  onDeleteReply,
}) => (
  <ListItem sx={{ alignItems: "flex-start", py: 1 }}>
    <Avatar
      sx={{
        bgcolor: reply.userColor,
        width: 28,
        height: 28,
        mr: 1,
        fontSize: "0.65rem",
      }}
    >
      {reply.userName[0]}
    </Avatar>
    <ListItemText
      primary={
        <Typography variant="subtitle2" sx={{ fontSize: "0.875rem" }}>
          {reply.userName}
        </Typography>
      }
      secondary={
        <Typography
          variant="body2"
          sx={{
            fontSize: "0.8125rem",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {reply.content}
        </Typography>
      }
      primaryTypographyProps={{ component: "div" }}
      secondaryTypographyProps={{ component: "div" }}
    />
    {currentUserId === reply.userId && (
      <ListItemSecondaryAction>
        <Tooltip title="削除">
          <AppDeleteIconButton
            outlined
            size="sm"
            aria-label="削除"
            onClick={() => onDeleteReply(parentCommentId, reply.id)}
          />
        </Tooltip>
      </ListItemSecondaryAction>
    )}
  </ListItem>
);

// ── ReplyInputForm ─────────────────────────────────────────────────
interface ReplyInputFormProps {
  replyContent: string;
  replyMentions: UserOption[];
  userNames: string[];
  availableUsers: UserOption[];
  onContentChange: (content: string) => void;
  onMentionsChange: (mentions: UserOption[]) => void;
  onSave: () => void;
  onCancel: () => void;
}

const ReplyInputForm: React.FC<ReplyInputFormProps> = ({
  replyContent,
  replyMentions,
  userNames,
  availableUsers,
  onContentChange,
  onMentionsChange,
  onSave,
  onCancel,
}) => (
  <Paper sx={{ ml: 4, p: 1.5, bgcolor: "background.default", mb: 1.5 }}>
    <TextField
      fullWidth
      multiline
      rows={2}
      placeholder="返信を入力..."
      value={replyContent}
      onChange={(e) => onContentChange(e.target.value)}
      size="small"
      variant="outlined"
    />
    <MentionAutocomplete
      userNames={userNames}
      value={replyMentions}
      availableUsers={availableUsers}
      onChange={onMentionsChange}
    />
    <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
      <Button size="small" variant="contained" onClick={onSave}>
        返信
      </Button>
      <Button size="small" variant="outlined" onClick={onCancel}>
        キャンセル
      </Button>
    </Box>
  </Paper>
);

// ── CommentItem ────────────────────────────────────────────────────
interface CommentItemProps {
  comment: CellComment;
  currentUserId: string;
  editingCommentId: string | null;
  editingContent: string;
  replyingToCommentId: string | null;
  replyContent: string;
  replyMentions: UserOption[];
  userNames: string[];
  availableUsers: UserOption[];
  onEditingContentChange: (content: string) => void;
  onStartEdit: (comment: CellComment) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onStartReply: (commentId: string) => void;
  onSaveReply: () => void;
  onCancelReply: () => void;
  onReplyContentChange: (content: string) => void;
  onReplyMentionsChange: (mentions: UserOption[]) => void;
  onDeleteComment: (commentId: string) => void;
  onDeleteReply: (parentCommentId: string, replyId: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  editingCommentId,
  editingContent,
  replyingToCommentId,
  replyContent,
  replyMentions,
  userNames,
  availableUsers,
  onEditingContentChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onStartReply,
  onSaveReply,
  onCancelReply,
  onReplyContentChange,
  onReplyMentionsChange,
  onDeleteComment,
  onDeleteReply,
}) => {
  const isEditing = editingCommentId === comment.id;
  const isReplying = replyingToCommentId === comment.id;

  return (
    <>
      <ListItem sx={{ alignItems: "flex-start", py: 1.5 }}>
        <Avatar
          sx={{
            bgcolor: comment.userColor,
            width: 32,
            height: 32,
            mr: 1,
            fontSize: "0.75rem",
          }}
        >
          {comment.userName[0]}
        </Avatar>
        <ListItemText
          primary={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {comment.userName}
              </Typography>
              <Typography
                variant="caption"
                sx={{ ml: 1, color: "text.secondary" }}
              >
                {new Date(comment.createdAt).toLocaleString("ja-JP")}
              </Typography>
              {comment.isEdited && (
                <Typography
                  variant="caption"
                  sx={{ ml: 0.5, color: "text.secondary" }}
                >
                  (編集済み)
                </Typography>
              )}
            </Box>
          }
          primaryTypographyProps={{ component: "div" }}
          secondary={
            isEditing ? (
              <CommentEditForm
                content={editingContent}
                onChange={onEditingContentChange}
                onSave={onSaveEdit}
                onCancel={onCancelEdit}
              />
            ) : (
              <Typography
                variant="body2"
                sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word", mt: 0.5 }}
              >
                {comment.content}
              </Typography>
            )
          }
          secondaryTypographyProps={{ component: "div" }}
        />
        {!isEditing && currentUserId === comment.userId && (
          <ListItemSecondaryAction>
            <Tooltip title="編集">
              <AppEditIconButton
                size="sm"
                aria-label="編集"
                onClick={() => onStartEdit(comment)}
                style={{ marginRight: 4 }}
              />
            </Tooltip>
            <Tooltip title="削除">
              <AppDeleteIconButton
                outlined
                size="sm"
                aria-label="削除"
                onClick={() => onDeleteComment(comment.id)}
              />
            </Tooltip>
          </ListItemSecondaryAction>
        )}
      </ListItem>

      {comment.replies && comment.replies.length > 0 && (
        <Box sx={{ ml: 4, borderLeft: "2px solid #e0e0e0", pl: 1.5 }}>
          {comment.replies.map((reply, replyIndex) => (
            <ReplyItem
              key={`${reply.id}-${reply.createdAt}-${replyIndex}`}
              reply={reply}
              currentUserId={currentUserId}
              parentCommentId={comment.id}
              onDeleteReply={onDeleteReply}
            />
          ))}
        </Box>
      )}

      {!isReplying && (
        <Box sx={{ ml: 4, mt: 0.5, mb: 1 }}>
          <Button
            size="small"
            startIcon={<ReplyIcon />}
            onClick={() => onStartReply(comment.id)}
            sx={{ textTransform: "none", fontSize: "0.8125rem" }}
          >
            返信
          </Button>
        </Box>
      )}

      {isReplying && (
        <ReplyInputForm
          replyContent={replyContent}
          replyMentions={replyMentions}
          userNames={userNames}
          availableUsers={availableUsers}
          onContentChange={onReplyContentChange}
          onMentionsChange={onReplyMentionsChange}
          onSave={onSaveReply}
          onCancel={onCancelReply}
        />
      )}

      <Divider sx={{ my: 1 }} />
    </>
  );
};

// ── NewCommentForm ─────────────────────────────────────────────────
interface NewCommentFormProps {
  content: string;
  mentions: UserOption[];
  userNames: string[];
  availableUsers: UserOption[];
  onContentChange: (content: string) => void;
  onMentionsChange: (mentions: UserOption[]) => void;
}

const NewCommentForm: React.FC<NewCommentFormProps> = ({
  content,
  mentions,
  userNames,
  availableUsers,
  onContentChange,
  onMentionsChange,
}) => (
  <Box sx={{ mt: 2 }}>
    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
      コメントを追加
    </Typography>
    <TextField
      fullWidth
      multiline
      rows={3}
      placeholder="コメントを入力... (@ユーザー名 でメンション可)"
      value={content}
      onChange={(e) => onContentChange(e.target.value)}
      variant="outlined"
      size="small"
    />
    <MentionAutocomplete
      userNames={userNames}
      value={mentions}
      availableUsers={availableUsers}
      onChange={onMentionsChange}
    />
  </Box>
);

/**
 * セルコメントダイアログ
 * コメント追加/編集/削除、返信機能を提供
 */
export const CellCommentDialog: React.FC<CellCommentDialogProps> = ({
  open,
  cellKey,
  staffName,
  date,
  comments,
  availableUsers,
  currentUserId,
  onClose,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onReplyComment,
  onDeleteReply,
}) => {
  const { parseMentions } = useShiftComments();
  const [newCommentContent, setNewCommentContent] = useState("");
  const [selectedMentions, setSelectedMentions] = useState<UserOption[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyMentions, setReplyMentions] = useState<UserOption[]>([]);

  const userNames = useMemo(
    () => availableUsers.map((u) => u.userName),
    [availableUsers],
  );

  const handleAddComment = useCallback(() => {
    if (!newCommentContent.trim()) return;
    const mentions = parseMentions(newCommentContent, availableUsers);
    onAddComment(cellKey, newCommentContent, mentions);
    setNewCommentContent("");
    setSelectedMentions([]);
  }, [newCommentContent, cellKey, onAddComment, availableUsers, parseMentions]);

  const handleStartEditComment = useCallback((comment: CellComment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  }, []);

  const handleSaveEditComment = useCallback(() => {
    if (!editingCommentId || !editingContent.trim()) return;
    const mentions = parseMentions(editingContent, availableUsers);
    onUpdateComment(editingCommentId, editingContent, mentions);
    setEditingCommentId(null);
    setEditingContent("");
  }, [editingCommentId, editingContent, onUpdateComment, availableUsers, parseMentions]);

  const handleCancelEditComment = useCallback(() => {
    setEditingCommentId(null);
    setEditingContent("");
  }, []);

  const handleStartReply = useCallback((parentCommentId: string) => {
    setReplyingToCommentId(parentCommentId);
    setReplyContent("");
    setReplyMentions([]);
  }, []);

  const handleSaveReply = useCallback(() => {
    if (!replyingToCommentId || !replyContent.trim()) return;
    const mentions = parseMentions(replyContent, availableUsers);
    onReplyComment(replyingToCommentId, replyContent, mentions);
    setReplyingToCommentId(null);
    setReplyContent("");
    setReplyMentions([]);
  }, [replyingToCommentId, replyContent, onReplyComment, availableUsers, parseMentions]);

  const handleCancelReply = useCallback(() => {
    setReplyingToCommentId(null);
    setReplyContent("");
    setReplyMentions([]);
  }, []);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {staffName} - {date}日のコメント
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          {comments.length > 0 ? (
            <List sx={{ maxHeight: 400, overflow: "auto", mb: 2 }}>
              {comments.map((comment, commentIndex) => (
                <CommentItem
                  key={`${comment.id}-${comment.createdAt}-${commentIndex}`}
                  comment={comment}
                  currentUserId={currentUserId}
                  editingCommentId={editingCommentId}
                  editingContent={editingContent}
                  replyingToCommentId={replyingToCommentId}
                  replyContent={replyContent}
                  replyMentions={replyMentions}
                  userNames={userNames}
                  availableUsers={availableUsers}
                  onEditingContentChange={setEditingContent}
                  onStartEdit={handleStartEditComment}
                  onSaveEdit={handleSaveEditComment}
                  onCancelEdit={handleCancelEditComment}
                  onStartReply={handleStartReply}
                  onSaveReply={handleSaveReply}
                  onCancelReply={handleCancelReply}
                  onReplyContentChange={setReplyContent}
                  onReplyMentionsChange={setReplyMentions}
                  onDeleteComment={onDeleteComment}
                  onDeleteReply={onDeleteReply}
                />
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              コメントはまだありません
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          <NewCommentForm
            content={newCommentContent}
            mentions={selectedMentions}
            userNames={userNames}
            availableUsers={availableUsers}
            onContentChange={setNewCommentContent}
            onMentionsChange={setSelectedMentions}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          キャンセル
        </Button>
        <Button
          variant="contained"
          onClick={handleAddComment}
          disabled={!newCommentContent.trim()}
        >
          コメント追加
        </Button>
      </DialogActions>
    </Dialog>
  );
};
