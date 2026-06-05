import type { ShiftRequestCommentInput } from "@shared/api/graphql/types";
import { useCallback, useRef, useState } from "react";

import {
  CellComment,
  CommentsMap,
  Mention,
  ShiftRequestCommentData,
  ShiftRequestData,
} from "../types/collaborative.types";

const generateCommentId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `comment_${crypto.randomUUID()}`;
  }
  return `comment_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

const ensureUniqueCommentId = (rawId: string, usedIds: Set<string>): string => {
  const baseId = rawId.trim() || generateCommentId();
  let candidate = baseId;
  let suffix = 1;
  while (usedIds.has(candidate)) {
    candidate = `${baseId}_${suffix}`;
    suffix += 1;
  }
  usedIds.add(candidate);
  return candidate;
};

const collectUsedCommentIds = (commentsMap: CommentsMap): Set<string> => {
  const usedIds = new Set<string>();
  commentsMap.forEach((comments) => {
    comments.forEach((comment) => {
      usedIds.add(comment.id);
      comment.replies?.forEach((reply) => {
        usedIds.add(reply.id);
      });
    });
  });
  return usedIds;
};

const createCommentObject = (
  cellKey: string,
  userId: string,
  userName: string,
  userColor: string,
  content: string,
  mentions: Mention[],
  usedIds: Set<string>,
): CellComment => {
  const now = new Date().toISOString();
  return {
    id: ensureUniqueCommentId(generateCommentId(), usedIds),
    cellKey,
    userId,
    userName,
    userColor,
    content,
    mentions,
    createdAt: now,
    updatedAt: now,
    isEdited: false,
    replies: [],
  };
};

const updateCommentInMap = (
  commentsMap: CommentsMap,
  commentId: string,
  content: string,
  mentions: Mention[],
): { next: CommentsMap; updatedComment: CellComment | null } => {
  for (const [cellKey, comments] of commentsMap) {
    const commentIndex = comments.findIndex((c) => c.id === commentId);
    if (commentIndex === -1) {
      continue;
    }

    const updatedComment: CellComment = {
      ...comments[commentIndex],
      content,
      mentions,
      updatedAt: new Date().toISOString(),
      isEdited: true,
    };
    const newComments = [...comments];
    newComments[commentIndex] = updatedComment;
    const next = new Map(commentsMap);
    next.set(cellKey, newComments);
    return { next, updatedComment };
  }

  return { next: commentsMap, updatedComment: null };
};

const deleteCommentFromMap = (
  commentsMap: CommentsMap,
  commentId: string,
): { next: CommentsMap; deleted: boolean; cellKey?: string } => {
  for (const [cellKey, comments] of commentsMap) {
    const filteredComments = comments.filter((c) => c.id !== commentId);
    if (filteredComments.length === comments.length) {
      continue;
    }

    const next = new Map(commentsMap);
    if (filteredComments.length === 0) {
      next.delete(cellKey);
    } else {
      next.set(cellKey, filteredComments);
    }
    return { next, deleted: true, cellKey };
  }

  return { next: commentsMap, deleted: false };
};

const replyToCommentInMap = (
  commentsMap: CommentsMap,
  parentCommentId: string,
  userId: string,
  userName: string,
  userColor: string,
  content: string,
  mentions: Mention[],
): { next: CommentsMap; reply: CellComment | null } => {
  for (const [cellKey, comments] of commentsMap) {
    const parentIndex = comments.findIndex((c) => c.id === parentCommentId);
    if (parentIndex === -1) {
      continue;
    }

    const parentComment = comments[parentIndex];
    const usedIds = collectUsedCommentIds(commentsMap);
    const reply = createCommentObject(
      parentComment.cellKey,
      userId,
      userName,
      userColor,
      content,
      mentions,
      usedIds,
    );
    const updatedParent: CellComment = {
      ...parentComment,
      replies: [...(parentComment.replies || []), reply],
      updatedAt: new Date().toISOString(),
    };
    const newComments = [...comments];
    newComments[parentIndex] = updatedParent;
    const next = new Map(commentsMap);
    next.set(cellKey, newComments);
    return { next, reply };
  }

  return { next: commentsMap, reply: null };
};

const deleteCommentReplyFromMap = (
  commentsMap: CommentsMap,
  parentCommentId: string,
  replyCommentId: string,
): { next: CommentsMap; deleted: boolean } => {
  for (const [cellKey, comments] of commentsMap) {
    const parentIndex = comments.findIndex((c) => c.id === parentCommentId);
    if (parentIndex === -1) {
      continue;
    }

    const parentComment = comments[parentIndex];
    if (!parentComment.replies) {
      continue;
    }

    const filteredReplies = parentComment.replies.filter(
      (r) => r.id !== replyCommentId,
    );
    if (filteredReplies.length === parentComment.replies.length) {
      continue;
    }

    const updatedParent: CellComment = {
      ...parentComment,
      replies: filteredReplies,
      updatedAt: new Date().toISOString(),
    };
    const newComments = [...comments];
    newComments[parentIndex] = updatedParent;
    const next = new Map(commentsMap);
    next.set(cellKey, newComments);
    return { next, deleted: true };
  }

  return { next: commentsMap, deleted: false };
};

const parseMentions = (
  content: string,
  availableUsers: { userId: string; userName: string }[],
): Mention[] => {
  const mentions: Mention[] = [];
  const mentionRegex = /@([\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+)/g;
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    const mentionedName = match[1];
    const user = availableUsers.find((u) => u.userName === mentionedName);
    if (user) {
      mentions.push({ userId: user.userId, userName: user.userName, position: match.index });
    }
  }
  return mentions;
};

const formatCommentWithMentions = (comment: CellComment): string => {
  let result = comment.content;
  comment.mentions.forEach((mention) => {
    result = result.replace(
      `@${mention.userName}`,
      `<span class="mention" data-user-id="${mention.userId}">@${mention.userName}</span>`,
    );
  });
  return result;
};

/**
 * シフトコメント管理フック
 * セルごとのコメント追加、更新、削除を管理
 */
export const useShiftComments = () => {
  const initialMap = new Map<string, CellComment[]>();
  const commentsMapRef = useRef<CommentsMap>(initialMap);
  const [commentsMap, setCommentsMap] = useState<CommentsMap>(initialMap);

  const applyUpdate = useCallback((next: CommentsMap) => {
    commentsMapRef.current = next;
    setCommentsMap(next);
  }, []);

  /**
   * コメントを追加
   */
  const addComment = useCallback(
    (
      cellKey: string,
      userId: string,
      userName: string,
      userColor: string,
      content: string,
      mentions: Mention[] = [],
    ): CellComment => {
      const usedIds = collectUsedCommentIds(commentsMapRef.current);
      const comment = createCommentObject(
        cellKey,
        userId,
        userName,
        userColor,
        content,
        mentions,
        usedIds,
      );

      const next = new Map(commentsMapRef.current);
      const existingComments = next.get(cellKey) || [];
      next.set(cellKey, [...existingComments, comment]);
      applyUpdate(next);

      return comment;
    },
    [applyUpdate],
  );

  /**
   * コメントを更新
   */
  const updateComment = useCallback(
    (
      commentId: string,
      content: string,
      mentions: Mention[] = [],
    ): CellComment | null => {
      const { next, updatedComment } = updateCommentInMap(
        commentsMapRef.current,
        commentId,
        content,
        mentions,
      );
      if (updatedComment) {
        applyUpdate(next);
      }
      return updatedComment;
    },
    [applyUpdate],
  );

  /**
   * コメントを削除
   */
  const deleteComment = useCallback(
    (commentId: string): { deleted: boolean; cellKey?: string } => {
      const { next, deleted, cellKey } = deleteCommentFromMap(
        commentsMapRef.current,
        commentId,
      );
      if (deleted) {
        applyUpdate(next);
      }
      return { deleted, cellKey };
    },
    [applyUpdate],
  );

  /**
   * セルのコメント一覧を取得
   */
  const getCommentsByCell = useCallback(
    (cellKey: string): CellComment[] => {
      return commentsMap.get(cellKey) || [];
    },
    [commentsMap],
  );

  /**
   * コメントに返信を追加
   */
  const replyToComment = useCallback(
    (
      parentCommentId: string,
      userId: string,
      userName: string,
      userColor: string,
      content: string,
      mentions: Mention[] = [],
    ): CellComment | null => {
      const { next, reply } = replyToCommentInMap(
        commentsMapRef.current,
        parentCommentId,
        userId,
        userName,
        userColor,
        content,
        mentions,
      );
      if (reply) {
        applyUpdate(next);
      }
      return reply;
    },
    [applyUpdate],
  );

  /**
   * コメントの返信を削除
   */
  const deleteCommentReply = useCallback(
    (parentCommentId: string, replyCommentId: string): boolean => {
      const { next, deleted } = deleteCommentReplyFromMap(
        commentsMapRef.current,
        parentCommentId,
        replyCommentId,
      );
      if (deleted) {
        applyUpdate(next);
      }
      return deleted;
    },
    [applyUpdate],
  );

  /**
   * 全コメント取得
   */
  const getAllComments = useCallback((): CommentsMap => {
    return new Map(commentsMap);
  }, [commentsMap]);

  /**
   * コメント数を取得（返信を含む）
   */
  const getCommentCount = useCallback(
    (cellKey: string): number => {
      const comments = commentsMap.get(cellKey) || [];
      return comments.reduce((count, comment) => {
        return count + 1 + (comment.replies?.length || 0);
      }, 0);
    },
    [commentsMap],
  );


  const commentDataToCellComment = useCallback(
    (c: ShiftRequestCommentData, usedIds: Set<string>): CellComment => ({
      id: ensureUniqueCommentId(c.id, usedIds),
      cellKey: c.cellKey,
      userId: c.staffId,
      userName: c.authorName ?? "",
      userColor: "rgb(25 118 210)",
      content: c.body,
      mentions: [],
      createdAt: c.createdAt,
      updatedAt: c.createdAt,
      isEdited: false,
      replies: [],
    }),
    [],
  );

  const loadCommentsFromShiftRequests = useCallback(
    (shiftRequests: ShiftRequestData[]) => {
      const next = new Map<string, CellComment[]>();
      const usedIds = new Set<string>();
      shiftRequests.forEach((sr) => {
        sr.comments?.forEach((c) => {
          const cellComment = commentDataToCellComment(c, usedIds);
          const existing = next.get(c.cellKey) || [];
          next.set(c.cellKey, [...existing, cellComment]);
        });
      });
      applyUpdate(next);
    },
    [commentDataToCellComment, applyUpdate],
  );

  const mergeRemoteComments = useCallback(
    (staffId: string, remoteComments: ShiftRequestCommentData[]) => {
      const next = new Map(commentsMapRef.current);

      // staffId に属する既存コメントを削除
      for (const key of next.keys()) {
        if (key.startsWith(`${staffId}#`)) {
          next.delete(key);
        }
      }

      const usedIds = collectUsedCommentIds(next);
      // リモートのコメントで上書き
      remoteComments.forEach((c) => {
        const cellComment = commentDataToCellComment(c, usedIds);
        const existing = next.get(c.cellKey) || [];
        next.set(c.cellKey, [...existing, cellComment]);
      });
      applyUpdate(next);
    },
    [commentDataToCellComment, applyUpdate],
  );

  const getCommentsInputForStaff = useCallback(
    (staffId: string): ShiftRequestCommentInput[] => {
      const result: ShiftRequestCommentInput[] = [];
      for (const [cellKey, cellComments] of commentsMapRef.current) {
        if (cellKey.startsWith(`${staffId}#`)) {
          cellComments.forEach((c) => {
            result.push({
              id: c.id,
              cellKey: c.cellKey,
              staffId: c.userId,
              authorName: c.userName,
              body: c.content,
              createdAt: c.createdAt,
            });
          });
        }
      }
      return result;
    },
    [],
  );

  return {
    addComment,
    updateComment,
    deleteComment,
    getCommentsByCell,
    replyToComment,
    deleteCommentReply,
    getAllComments,
    getCommentCount,
    parseMentions,
    formatCommentWithMentions,
    loadCommentsFromShiftRequests,
    mergeRemoteComments,
    getCommentsInputForStaff,
  };
};

export type UseShiftComments = ReturnType<typeof useShiftComments>;
