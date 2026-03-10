import type { ShiftRequestCommentInput } from "@shared/api/graphql/types";
import { useCallback, useRef, useState } from "react";

import {
  CellComment,
  CommentsMap,
  Mention,
  ShiftRequestCommentData,
  ShiftRequestData,
} from "../types/collaborative.types";

/**
 * シフトコメント管理フック
 * セルごとのコメント追加、更新、削除を管理
 */
export const useShiftComments = () => {
  const initialMap = new Map<string, CellComment[]>();
  const commentsMapRef = useRef<CommentsMap>(initialMap);
  const [commentsMap, setCommentsMap] = useState<CommentsMap>(initialMap);
  const commentIdCounterRef = useRef(0);

  const applyUpdate = useCallback((next: CommentsMap) => {
    commentsMapRef.current = next;
    setCommentsMap(next);
  }, []);

  /**
   * ユーザー情報からコメント作成
   */
  const createCommentObject = useCallback(
    (
      cellKey: string,
      userId: string,
      userName: string,
      userColor: string,
      content: string,
      mentions: Mention[],
    ): CellComment => {
      const now = new Date().toISOString();
      return {
        id: `comment_${commentIdCounterRef.current++}`,
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
    },
    [],
  );

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
      const comment = createCommentObject(
        cellKey,
        userId,
        userName,
        userColor,
        content,
        mentions,
      );

      const next = new Map(commentsMapRef.current);
      const existingComments = next.get(cellKey) || [];
      next.set(cellKey, [...existingComments, comment]);
      applyUpdate(next);

      return comment;
    },
    [createCommentObject, applyUpdate],
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
      for (const [cellKey, comments] of commentsMapRef.current) {
        const commentIndex = comments.findIndex((c) => c.id === commentId);
        if (commentIndex !== -1) {
          const updatedComment: CellComment = {
            ...comments[commentIndex],
            content,
            mentions,
            updatedAt: new Date().toISOString(),
            isEdited: true,
          };
          const newComments = [...comments];
          newComments[commentIndex] = updatedComment;
          const next = new Map(commentsMapRef.current);
          next.set(cellKey, newComments);
          applyUpdate(next);
          return updatedComment;
        }
      }
      return null;
    },
    [applyUpdate],
  );

  /**
   * コメントを削除
   */
  const deleteComment = useCallback(
    (commentId: string): { deleted: boolean; cellKey?: string } => {
      for (const [cellKey, comments] of commentsMapRef.current) {
        const filteredComments = comments.filter((c) => c.id !== commentId);
        if (filteredComments.length !== comments.length) {
          const next = new Map(commentsMapRef.current);
          if (filteredComments.length === 0) {
            next.delete(cellKey);
          } else {
            next.set(cellKey, filteredComments);
          }
          applyUpdate(next);
          return { deleted: true, cellKey };
        }
      }
      return { deleted: false };
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
      for (const [cellKey, comments] of commentsMapRef.current) {
        const parentIndex = comments.findIndex((c) => c.id === parentCommentId);
        if (parentIndex !== -1) {
          const parentComment = comments[parentIndex];
          const reply = createCommentObject(
            parentComment.cellKey,
            userId,
            userName,
            userColor,
            content,
            mentions,
          );

          const updatedParent: CellComment = {
            ...parentComment,
            replies: [...(parentComment.replies || []), reply],
            updatedAt: new Date().toISOString(),
          };
          const newComments = [...comments];
          newComments[parentIndex] = updatedParent;
          const next = new Map(commentsMapRef.current);
          next.set(cellKey, newComments);
          applyUpdate(next);
          return reply;
        }
      }
      return null;
    },
    [createCommentObject, applyUpdate],
  );

  /**
   * コメントの返信を削除
   */
  const deleteCommentReply = useCallback(
    (parentCommentId: string, replyCommentId: string): boolean => {
      for (const [cellKey, comments] of commentsMapRef.current) {
        const parentIndex = comments.findIndex((c) => c.id === parentCommentId);
        if (parentIndex !== -1) {
          const parentComment = comments[parentIndex];
          if (parentComment.replies) {
            const filteredReplies = parentComment.replies.filter(
              (r) => r.id !== replyCommentId,
            );
            if (filteredReplies.length !== parentComment.replies.length) {
              const updatedParent: CellComment = {
                ...parentComment,
                replies: filteredReplies,
                updatedAt: new Date().toISOString(),
              };
              const newComments = [...comments];
              newComments[parentIndex] = updatedParent;
              const next = new Map(commentsMapRef.current);
              next.set(cellKey, newComments);
              applyUpdate(next);
              return true;
            }
          }
        }
      }
      return false;
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

  /**
   * メンションを解析
   * @ユーザー名 形式を抽出
   */
  const parseMentions = useCallback(
    (
      content: string,
      availableUsers: { userId: string; userName: string }[],
    ): Mention[] => {
      const mentions: Mention[] = [];
      // @の後に続く単語またはユーザー名を抽出（スペースまたは終端まで）
      const mentionRegex = /@([\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+)/g;
      let match;

      while ((match = mentionRegex.exec(content)) !== null) {
        const mentionedName = match[1];
        const user = availableUsers.find((u) => u.userName === mentionedName);

        if (user) {
          mentions.push({
            userId: user.userId,
            userName: user.userName,
            position: match.index,
          });
        }
      }

      return mentions;
    },
    [],
  );

  /**
   * メンション付きコンテンツをHTMLに変換
   */
  const formatCommentWithMentions = useCallback(
    (comment: CellComment): string => {
      let result = comment.content;

      // メンションを@userNameからリンク形式に変換
      comment.mentions.forEach((mention) => {
        result = result.replace(
          `@${mention.userName}`,
          `<span class="mention" data-user-id="${mention.userId}">@${mention.userName}</span>`,
        );
      });

      return result;
    },
    [],
  );

  const commentDataToCellComment = useCallback(
    (c: ShiftRequestCommentData): CellComment => ({
      id: c.id,
      cellKey: c.cellKey,
      userId: c.staffId,
      userName: c.authorName ?? "",
      userColor: "#1976d2",
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
      shiftRequests.forEach((sr) => {
        sr.comments?.forEach((c) => {
          const cellComment = commentDataToCellComment(c);
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

      // リモートのコメントで上書き
      remoteComments.forEach((c) => {
        const cellComment = commentDataToCellComment(c);
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
