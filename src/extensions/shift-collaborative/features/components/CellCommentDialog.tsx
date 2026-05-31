import { Dialog, DialogActions, DialogTitle } from "@mui/material";
import { AppButton } from "@shared/ui/button";
import React from "react";

import { useCellCommentDialogState } from "../hooks/useCellCommentDialogState";
import { CellComment, Mention } from "../types/collaborative.types";
import { CellCommentDialogBody } from "./cell-comment-dialog/CellCommentDialogBody";

type UserOption = { userId: string; userName: string };

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
  const {
    newCommentContent,
    selectedMentions,
    editingCommentId,
    editingContent,
    replyingToCommentId,
    replyContent,
    replyMentions,
    userNames,
    setNewCommentContent,
    setSelectedMentions,
    setEditingContent,
    setReplyContent,
    setReplyMentions,
    handleAddComment,
    handleStartEditComment,
    handleSaveEditComment,
    handleCancelEditComment,
    handleStartReply,
    handleSaveReply,
    handleCancelReply,
  } = useCellCommentDialogState({
    cellKey,
    availableUsers,
    onAddComment,
    onUpdateComment,
    onReplyComment,
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {staffName} - {date}日のコメント
      </DialogTitle>

      <CellCommentDialogBody
        comments={comments}
        currentUserId={currentUserId}
        availableUsers={availableUsers}
        newCommentContent={newCommentContent}
        selectedMentions={selectedMentions}
        editingCommentId={editingCommentId}
        editingContent={editingContent}
        replyingToCommentId={replyingToCommentId}
        replyContent={replyContent}
        replyMentions={replyMentions}
        userNames={userNames}
        onSetNewCommentContent={setNewCommentContent}
        onSetSelectedMentions={setSelectedMentions}
        onSetEditingContent={setEditingContent}
        onSetReplyContent={setReplyContent}
        onSetReplyMentions={setReplyMentions}
        onStartEdit={handleStartEditComment}
        onSaveEdit={handleSaveEditComment}
        onCancelEdit={handleCancelEditComment}
        onStartReply={handleStartReply}
        onSaveReply={handleSaveReply}
        onCancelReply={handleCancelReply}
        onDeleteComment={onDeleteComment}
        onDeleteReply={onDeleteReply}
      />

      <DialogActions sx={{ p: 2 }}>
        <AppButton variant="outline" tone="neutral" onClick={onClose}>
          キャンセル
        </AppButton>
        <AppButton
          variant="solid"
          onClick={handleAddComment}
          disabled={!newCommentContent.trim()}
        >
          コメント追加
        </AppButton>
      </DialogActions>
    </Dialog>
  );
};
