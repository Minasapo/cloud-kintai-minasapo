import { useCallback, useMemo, useState } from "react";

import { CellComment, Mention } from "../types/collaborative.types";
import { useShiftComments } from "./useShiftComments";

export type UserOption = { userId: string; userName: string };

interface UseCellCommentDialogStateParams {
  cellKey: string;
  availableUsers: UserOption[];
  onAddComment: (cellKey: string, content: string, mentions: Mention[]) => void;
  onUpdateComment: (
    commentId: string,
    content: string,
    mentions: Mention[],
  ) => void;
  onReplyComment: (
    parentCommentId: string,
    content: string,
    mentions: Mention[],
  ) => void;
}

export const useCellCommentDialogState = ({
  cellKey,
  availableUsers,
  onAddComment,
  onUpdateComment,
  onReplyComment,
}: UseCellCommentDialogStateParams) => {
  const { parseMentions } = useShiftComments();
  const [newCommentContent, setNewCommentContent] = useState("");
  const [selectedMentions, setSelectedMentions] = useState<UserOption[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(
    null,
  );
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
  }, [newCommentContent, availableUsers, onAddComment, cellKey, parseMentions]);

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
  }, [editingCommentId, editingContent, availableUsers, onUpdateComment, parseMentions]);

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
  }, [replyingToCommentId, replyContent, availableUsers, onReplyComment, parseMentions]);

  const handleCancelReply = useCallback(() => {
    setReplyingToCommentId(null);
    setReplyContent("");
    setReplyMentions([]);
  }, []);

  return {
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
  };
};
