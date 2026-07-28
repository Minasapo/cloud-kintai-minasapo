import {
  useCreateShiftRequestMutation,
  useUpdateShiftCellMutation,
} from "@entities/shift/api/shiftApi";
import type { ShiftRequestCommentInput } from "@shared/api/graphql/types";
import { createLogger } from "@shared/lib/logger";
import { useCallback, useMemo } from "react";

import { normalizeShiftRequest } from "../lib/shiftTransformers";
import {
  CellComment,
  Mention,
  ShiftRequestData,
} from "../types/collaborative.types";

type UpdateShiftCellMutationTrigger = ReturnType<
  typeof useUpdateShiftCellMutation
>[0];

const logger = createLogger("CommentOperations");

export interface CommentOperationCallbacks {
  onCommentPersistStarted?: () => void;
  onCommentPersistCompleted?: () => void;
  onCommentPersistFailed?: (error: string) => void;
}

interface UseCommentOperationsProps {
  targetMonth: string;
  currentUserId: string;
  currentUserName: string;
  currentUserColor: string;
  getShiftRequest: (staffId: string) => ShiftRequestData | undefined;
  upsertShiftRequest: (request: ShiftRequestData) => void;
  getCommentsInputForStaff: (staffId: string) => ShiftRequestCommentInput[];
  addComment: (
    cellKey: string,
    userId: string,
    userName: string,
    color: string,
    content: string,
    mentions: Mention[],
  ) => CellComment;
  updateComment: (
    commentId: string,
    content: string,
    mentions?: Mention[],
  ) => CellComment | null;
  deleteComment: (commentId: string) => { deleted: boolean; cellKey?: string };
  getCommentsByCell: (cellKey: string) => CellComment[];
  replyToComment: (
    parentCommentId: string,
    userId: string,
    userName: string,
    userColor: string,
    content: string,
    mentions?: Mention[],
  ) => CellComment | null;
  deleteCommentReply: (
    parentCommentId: string,
    replyCommentId: string,
  ) => { deleted: boolean; cellKey?: string };
  callbacks?: CommentOperationCallbacks;
}

interface CommentOperations {
  addComment: (
    cellKey: string,
    content: string,
    mentions: Mention[],
  ) => Promise<CellComment>;
  updateComment: (
    commentId: string,
    content: string,
    mentions: Mention[],
  ) => Promise<CellComment>;
  deleteComment: (commentId: string) => Promise<void>;
  getCommentsByCell: (cellKey: string) => CellComment[];
  replyToComment: (
    parentCommentId: string,
    content: string,
    mentions: Mention[],
  ) => Promise<CellComment>;
  deleteCommentReply: (
    parentCommentId: string,
    replyCommentId: string,
  ) => Promise<void>;
}

/**
 * RTK Query 経由でコメントを永続化する
 * 成功時はローカルの shiftRequest キャッシュ（shiftRequestsRef）を更新し、
 * 次回の loadCommentsFromShiftRequests 実行で追加直後のコメントが
 * 消えてしまわないようにする。失敗時はコールバックで通知する。
 */
const persistCommentsToServer = async (
  staffId: string,
  shiftRequest: ShiftRequestData,
  getCommentsInput: () => ShiftRequestCommentInput[],
  currentUserId: string,
  updateShiftCell: UpdateShiftCellMutationTrigger,
  upsertShiftRequest: (request: ShiftRequestData) => void,
  onStart?: () => void,
  onSuccess?: () => void,
  onError?: (error: string) => void,
): Promise<void> => {
  try {
    onStart?.();
    const updated = await updateShiftCell({
      input: {
        id: shiftRequest.id,
        comments: getCommentsInput(),
        updatedBy: currentUserId,
        updatedAt: new Date().toISOString(),
      },
    }).unwrap();
    upsertShiftRequest(normalizeShiftRequest(updated));
    onSuccess?.();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "コメント保存に失敗しました";
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
  targetMonth,
  currentUserId,
  currentUserName,
  currentUserColor,
  getShiftRequest,
  upsertShiftRequest,
  getCommentsInputForStaff,
  addComment: addCommentLocal,
  updateComment: updateCommentLocal,
  deleteComment: deleteCommentLocal,
  getCommentsByCell: getCommentsByCellLocal,
  replyToComment: replyToCommentLocal,
  deleteCommentReply: deleteCommentReplyLocal,
  callbacks,
}: UseCommentOperationsProps): CommentOperations => {
  const [createShiftRequest] = useCreateShiftRequestMutation();
  const [updateShiftCell] = useUpdateShiftCellMutation();

  const getStaffIdFromCellKey = useCallback(
    (cellKey: string) => cellKey.split("#")[0] ?? "",
    [],
  );

  const ensureShiftRequestForComments = useCallback(
    async (staffId: string): Promise<ShiftRequestData> => {
      const existing = getShiftRequest(staffId);
      if (existing) {
        return existing;
      }

      const timestamp = new Date().toISOString();
      const created = await createShiftRequest({
        input: {
          staffId,
          targetMonth,
          entries: [],
          comments: getCommentsInputForStaff(staffId),
          updatedBy: currentUserId,
          updatedAt: timestamp,
          version: 1,
          histories: [
            {
              version: 1,
              entries: [],
              recordedAt: timestamp,
              recordedByStaffId: currentUserId,
            },
          ],
        },
      }).unwrap();

      const normalized = normalizeShiftRequest(created);
      upsertShiftRequest(normalized);
      return normalized;
    },
    [
      createShiftRequest,
      currentUserId,
      getCommentsInputForStaff,
      getShiftRequest,
      targetMonth,
      upsertShiftRequest,
    ],
  );

  const persistCommentsByCellKey = useCallback(
    async (cellKey: string) => {
      const staffId = getStaffIdFromCellKey(cellKey);
      if (!staffId) return;

      const shiftRequest = await ensureShiftRequestForComments(staffId);

      await persistCommentsToServer(
        staffId,
        shiftRequest,
        () => getCommentsInputForStaff(staffId),
        currentUserId,
        updateShiftCell,
        upsertShiftRequest,
        callbacks?.onCommentPersistStarted,
        callbacks?.onCommentPersistCompleted,
        callbacks?.onCommentPersistFailed,
      );
    },
    [
      ensureShiftRequestForComments,
      getStaffIdFromCellKey,
      getCommentsInputForStaff,
      currentUserId,
      updateShiftCell,
      upsertShiftRequest,
      callbacks,
    ],
  );

  const addCommentHandler = useCallback(
    async (
      cellKey: string,
      content: string,
      mentions: Mention[],
    ): Promise<CellComment> => {
      const comment = addCommentLocal(
        cellKey,
        currentUserId,
        currentUserName,
        currentUserColor,
        content,
        mentions,
      );
      try {
        await persistCommentsByCellKey(cellKey);
      } catch (err) {
        logger.error(
          "Failed to persist new comment, but local change is retained:",
          err,
        );
        // ローカル状態は保持してユーザーが再試行できるようにする
      }
      return comment;
    },
    [
      addCommentLocal,
      currentUserId,
      currentUserName,
      currentUserColor,
      persistCommentsByCellKey,
    ],
  );

  const updateCommentHandler = useCallback(
    async (
      commentId: string,
      content: string,
      mentions: Mention[],
    ): Promise<CellComment> => {
      const updated = updateCommentLocal(commentId, content, mentions);
      if (!updated) throw new Error(`Comment ${commentId} not found`);
      try {
        await persistCommentsByCellKey(updated.cellKey);
      } catch (err) {
        logger.error(
          "Failed to persist comment update, but local change is retained:",
          err,
        );
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
          logger.error(
            "Failed to persist comment deletion, but local change is retained:",
            err,
          );
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
    async (
      parentCommentId: string,
      content: string,
      mentions: Mention[],
    ): Promise<CellComment> => {
      const reply = replyToCommentLocal(
        parentCommentId,
        currentUserId,
        currentUserName,
        currentUserColor,
        content,
        mentions,
      );
      if (!reply)
        throw new Error(`Parent comment ${parentCommentId} not found`);
      try {
        await persistCommentsByCellKey(reply.cellKey);
      } catch (err) {
        logger.error(
          "Failed to persist comment reply, but local change is retained:",
          err,
        );
      }
      return reply;
    },
    [
      replyToCommentLocal,
      currentUserId,
      currentUserName,
      currentUserColor,
      persistCommentsByCellKey,
    ],
  );

  const deleteCommentReplyHandler = useCallback(
    async (parentCommentId: string, replyCommentId: string): Promise<void> => {
      const { cellKey } = deleteCommentReplyLocal(
        parentCommentId,
        replyCommentId,
      );
      if (cellKey) {
        try {
          await persistCommentsByCellKey(cellKey);
        } catch (err) {
          logger.error(
            "Failed to persist comment reply deletion, but local change is retained:",
            err,
          );
        }
      }
    },
    [deleteCommentReplyLocal, persistCommentsByCellKey],
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
