import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import { updateShiftRequest } from "@shared/api/graphql/documents/mutations";
import type { ShiftRequestCommentInput } from "@shared/api/graphql/types";
import { createLogger } from "@shared/lib/logger";
import { useCallback, useMemo } from "react";

import {
  CellComment,
  Mention,
  ShiftRequestData,
} from "../types/collaborative.types";

const logger = createLogger("CommentOperations");

export interface CommentOperationCallbacks {
  onCommentPersistStarted?: () => void;
  onCommentPersistCompleted?: () => void;
  onCommentPersistFailed?: (error: string) => void;
}

interface UseCommentOperationsProps {
  currentUserId: string;
  currentUserName: string;
  currentUserColor: string;
  getShiftRequest: (staffId: string) => ShiftRequestData | undefined;
  getCommentsInputForStaff: (staffId: string) => ShiftRequestCommentInput[];
  addComment: (cellKey: string, userId: string, userName: string, color: string, content: string, mentions: Mention[]) => CellComment;
  updateComment: (commentId: string, content: string, mentions?: Mention[]) => CellComment | null;
  deleteComment: (commentId: string) => { deleted: boolean; cellKey?: string };
  getCommentsByCell: (cellKey: string) => CellComment[];
  replyToComment: (parentCommentId: string, userId: string, userName: string, userColor: string, content: string, mentions?: Mention[]) => CellComment | null;
  deleteCommentReply: (parentCommentId: string, replyCommentId: string) => boolean;
  callbacks?: CommentOperationCallbacks;
}

interface CommentOperations {
  addComment: (cellKey: string, content: string, mentions: Mention[]) => Promise<CellComment>;
  updateComment: (commentId: string, content: string, mentions: Mention[]) => Promise<CellComment>;
  deleteComment: (commentId: string) => Promise<void>;
  getCommentsByCell: (cellKey: string) => CellComment[];
  replyToComment: (parentCommentId: string, content: string, mentions: Mention[]) => Promise<CellComment>;
  deleteCommentReply: (parentCommentId: string, replyCommentId: string) => Promise<void>;
}

/**
 * GraphQL を使用してコメントを永続化する
 * 失敗時はコールバックで通知
 */
const persistCommentsToServer = async (
  staffId: string,
  shiftRequest: ShiftRequestData,
  getCommentsInput: () => ShiftRequestCommentInput[],
  currentUserId: string,
  onStart?: () => void,
  onSuccess?: () => void,
  onError?: (error: string) => void,
): Promise<void> => {
  try {
    onStart?.();
    await graphqlClient.graphql({
      query: updateShiftRequest,
      variables: {
        input: {
          id: shiftRequest.id,
          comments: getCommentsInput(),
          updatedBy: currentUserId,
          updatedAt: new Date().toISOString(),
        },
      },
      authMode: "userPool",
    });
    onSuccess?.();
  } catch (err) {
    const message = err instanceof Error ? err.message : "コメント保存に失敗しました";
    logger.error(`Failed to persist comments for staff ${staffId}:`, err);
    onError?.(message);
    throw new Error(`Comment persistence failed: ${message}`);
  }
};

/**
 * セルコメント操作（追加・更新・削除・返信）の統合管理
 * 永続化時のエラーハンドリングと通知を含む
 */
export const useCommentOperations = ({
  currentUserId,
  currentUserName,
  currentUserColor,
  getShiftRequest,
  getCommentsInputForStaff,
  addComment: addCommentLocal,
  updateComment: updateCommentLocal,
  deleteComment: deleteCommentLocal,
  getCommentsByCell: getCommentsByCellLocal,
  replyToComment: replyToCommentLocal,
  deleteCommentReply: deleteCommentReplyLocal,
  callbacks,
}: UseCommentOperationsProps): CommentOperations => {
  const getStaffIdFromCellKey = useCallback(
    (cellKey: string) => cellKey.split("#")[0] ?? "",
    [],
  );

  const persistCommentsByCellKey = useCallback(
    async (cellKey: string) => {
      const staffId = getStaffIdFromCellKey(cellKey);
      if (!staffId) return;

      const shiftRequest = getShiftRequest(staffId);
      if (!shiftRequest) {
        logger.warn(`No shift request found for staff ${staffId}`);
        return;
      }

      await persistCommentsToServer(
        staffId,
        shiftRequest,
        () => getCommentsInputForStaff(staffId),
        currentUserId,
        callbacks?.onCommentPersistStarted,
        callbacks?.onCommentPersistCompleted,
        callbacks?.onCommentPersistFailed,
      );
    },
    [
      getStaffIdFromCellKey,
      getShiftRequest,
      getCommentsInputForStaff,
      currentUserId,
      callbacks,
    ],
  );

  const addCommentHandler = useCallback(
    async (cellKey: string, content: string, mentions: Mention[]): Promise<CellComment> => {
      const comment = addCommentLocal(cellKey, currentUserId, currentUserName, currentUserColor, content, mentions);
      try {
        await persistCommentsByCellKey(cellKey);
      } catch (err) {
        logger.error("Failed to persist new comment, but local change is retained:", err);
        // ローカル状態は保持してユーザーが再試行できるようにする
      }
      return comment;
    },
    [addCommentLocal, currentUserId, currentUserName, currentUserColor, persistCommentsByCellKey],
  );

  const updateCommentHandler = useCallback(
    async (commentId: string, content: string, mentions: Mention[]): Promise<CellComment> => {
      const updated = updateCommentLocal(commentId, content, mentions);
      if (!updated) throw new Error(`Comment ${commentId} not found`);
      try {
        await persistCommentsByCellKey(updated.cellKey);
      } catch (err) {
        logger.error("Failed to persist comment update, but local change is retained:", err);
      }
      return updated;
    },
    [updateCommentLocal, persistCommentsByCellKey],
  );

  const deleteCommentHandler = useCallback(
    async (commentId: string): Promise<void> => {
      const { cellKey } = deleteCommentLocal(commentId);
      if (cellKey) {
        try {
          await persistCommentsByCellKey(cellKey);
        } catch (err) {
          logger.error("Failed to persist comment deletion, but local change is retained:", err);
        }
      }
    },
    [deleteCommentLocal, persistCommentsByCellKey],
  );

  const getCommentsByCellHandler = useCallback(
    (cellKey: string): CellComment[] => getCommentsByCellLocal(cellKey),
    [getCommentsByCellLocal],
  );

  const replyToCommentHandler = useCallback(
    async (parentCommentId: string, content: string, mentions: Mention[]): Promise<CellComment> => {
      const reply = replyToCommentLocal(
        parentCommentId, currentUserId, currentUserName, currentUserColor, content, mentions,
      );
      if (!reply) throw new Error(`Parent comment ${parentCommentId} not found`);
      try {
        await persistCommentsByCellKey(reply.cellKey);
      } catch (err) {
        logger.error("Failed to persist comment reply, but local change is retained:", err);
      }
      return reply;
    },
    [replyToCommentLocal, currentUserId, currentUserName, currentUserColor, persistCommentsByCellKey],
  );

  const deleteCommentReplyHandler = useCallback(
    async (parentCommentId: string, replyCommentId: string): Promise<void> => {
      deleteCommentReplyLocal(parentCommentId, replyCommentId);
      // 親コメントのセルキーを取得するために、ローカルコメント取得関数を使用
      const allComments = getCommentsByCellLocal("all-cells");
      const parentComment = allComments.find((c) => c.id === parentCommentId);
      if (parentComment) {
        try {
          await persistCommentsByCellKey(parentComment.cellKey);
        } catch (err) {
          logger.error("Failed to persist comment reply deletion, but local change is retained:", err);
        }
      }
    },
    [deleteCommentReplyLocal, persistCommentsByCellKey, getCommentsByCellLocal],
  );

  return useMemo(
    () => ({
      addComment: addCommentHandler,
      updateComment: updateCommentHandler,
      deleteComment: deleteCommentHandler,
      getCommentsByCell: getCommentsByCellHandler,
      replyToComment: replyToCommentHandler,
      deleteCommentReply: deleteCommentReplyHandler,
    }),
    [
      addCommentHandler,
      updateCommentHandler,
      deleteCommentHandler,
      getCommentsByCellHandler,
      replyToCommentHandler,
      deleteCommentReplyHandler,
    ],
  );
};
