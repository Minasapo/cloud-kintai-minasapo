import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import { updateShiftRequest } from "@/shared/api/graphql/documents/mutations";

import {
  CollaborativeShiftContext,
  CollaborativeShiftContextType,
} from "../context/CollaborativeShiftContext";
import { useCellChangeHistory } from "../hooks/useCellChangeHistory";
import { useCollaborativeShiftData } from "../hooks/useCollaborativeShiftData";
import { useCollaborativeShiftOffline } from "../hooks/useCollaborativeShiftOffline";
import { useShiftComments } from "../hooks/useShiftComments";
import { useShiftPresence } from "../hooks/useShiftPresence";
import { useShiftSync } from "../hooks/useShiftSync";
import { useUndoRedo } from "../hooks/useUndoRedo";
import {
  CellComment,
  CollaborativeShiftState,
  Mention,
  ShiftCellUpdate,
  ShiftRequestCommentData,
  ShiftRequestData,
  shiftRequestStatusToShiftState,
  ShiftState,
} from "../types/collaborative.types";

interface CollaborativeShiftProviderProps {
  children: React.ReactNode;
  staffIds: string[];
  targetMonth: string;
  currentUserId: string;
  currentUserName: string;
  shiftRequestId: string;
}

export const CollaborativeShiftProvider: React.FC<
  CollaborativeShiftProviderProps
> = ({
  children,
  staffIds,
  targetMonth,
  currentUserId,
  currentUserName,
  shiftRequestId,
}) => {
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [showHistory, setShowHistory] = useState(false);
  const [lastRemoteUpdate, setLastRemoteUpdate] = useState<{
    staffId: string;
    timestamp: number;
  } | null>(null);

  // コメント管理フック
  const {
    addComment,
    updateComment,
    deleteComment,
    getCommentsByCell,
    replyToComment,
    deleteCommentReply,
    loadCommentsFromShiftRequests,
    mergeRemoteComments,
    getCommentsInputForStaff,
  } = useShiftComments();

  // fetchShifts への参照ブリッジ（同期フックをデータフックより先に初期化するため）
  const fetchShiftsRef = useRef<() => Promise<void>>(() => Promise.resolve());

  // セル単位変更履歴フック
  const {
    recordCellChange,
    recordBatchCellChanges,
    recordRemoteChange,
    getCellHistory,
    getAllCellHistory,
    getStaffCellHistory,
  } = useCellChangeHistory();

  // shiftDataMap への参照（リモート差分計算用）
  const shiftDataMapRef = useRef<
    Map<string, Map<string, { state: ShiftState; isLocked: boolean }>>
  >(new Map());

  const handleRemoteUpdate = useCallback(
    (staffId: string, request: ShiftRequestData) => {
      setLastRemoteUpdate({ staffId, timestamp: Date.now() });

      // リモート更新のセル単位差分を記録
      const currentStaffData = shiftDataMapRef.current.get(staffId);
      const entries = request.entries ?? [];
      for (const entry of entries) {
        const dayKey = entry.date;
        const previousCell = currentStaffData?.get(dayKey);
        const newState = shiftRequestStatusToShiftState(entry.status);
        const previousState = previousCell?.state;

        // 変化があった場合のみ記録
        if (previousState !== newState) {
          recordRemoteChange(
            staffId,
            dayKey,
            previousState,
            newState,
            request.updatedBy ?? "unknown",
            request.updatedBy ?? "不明",
          );
        }
      }
    },
    [recordRemoteChange],
  );

  const handleCommentsReceived = useCallback(
    (staffId: string, comments: ShiftRequestCommentData[]) => {
      mergeRemoteComments(staffId, comments);
    },
    [mergeRemoteComments],
  );

  // 同期コーディネータフック（Subscription ファースト）
  const {
    isSyncing,
    syncError,
    triggerSync,
    lastAutoSyncedAt,
    lastSyncedAt,
    dataStatus,
    notifyAutoSyncReceived,
    notifySaveStarted,
    notifySaveCompleted,
    notifySaveFailed,
    clearSyncError,
  } = useShiftSync({
    onManualSync: async () => {
      await fetchShiftsRef.current();
    },
  });

  // データ管理フック
  const {
    shiftDataMap,
    pendingChanges,
    isLoading,
    isBatchUpdating,
    error,
    connectionState,
    fetchShifts,
    updateShift,
    batchUpdateShifts,
    retryPendingChanges,
    getShiftRequest,
    getAllShiftRequests,
  } = useCollaborativeShiftData({
    staffIds,
    targetMonth,
    currentUserId,
    onAutoSyncReceived: notifyAutoSyncReceived,
    onSaveStarted: notifySaveStarted,
    onSaveCompleted: notifySaveCompleted,
    onSaveFailed: notifySaveFailed,
    onRemoteUpdate: handleRemoteUpdate,
    onCommentsReceived: handleCommentsReceived,
  });

  // fetchShifts 参照を同期
  useEffect(() => {
    fetchShiftsRef.current = fetchShifts;
  }, [fetchShifts]);

  // shiftDataMapRef をリモート差分計算用に同期
  useEffect(() => {
    shiftDataMapRef.current = shiftDataMap;
  }, [shiftDataMap]);

  // 初期データ読み込み時にコメントをロード
  const commentsInitializedRef = useRef(false);
  useEffect(() => {
    if (isLoading || commentsInitializedRef.current) {
      return;
    }
    const allRequests = getAllShiftRequests();
    if (allRequests.length > 0) {
      loadCommentsFromShiftRequests(allRequests);
      commentsInitializedRef.current = true;
    }
  }, [isLoading, getAllShiftRequests, loadCommentsFromShiftRequests]);

  const persistComments = useCallback(
    async (staffId: string) => {
      const shiftRequest = getShiftRequest(staffId);
      if (!shiftRequest) return;

      const commentsInput = getCommentsInputForStaff(staffId);
      try {
        await graphqlClient.graphql({
          query: updateShiftRequest,
          variables: {
            input: {
              id: shiftRequest.id,
              comments: commentsInput,
              updatedBy: currentUserId,
              updatedAt: new Date().toISOString(),
            },
          },
          authMode: "userPool",
        });
      } catch (err) {
        console.error("Failed to persist comments:", err);
      }
    },
    [getShiftRequest, getCommentsInputForStaff, currentUserId],
  );

  // オフライン対応フック
  const {
    isOnline,
    hasPendingChanges,
    updateShiftWithOfflineSupport,
    batchUpdateShiftsWithOfflineSupport,
    syncPendingChanges,
  } = useCollaborativeShiftOffline({
    enabled: true,
    onUpdateShift: updateShift,
    onBatchUpdateShifts: batchUpdateShifts,
    onConflictDetected: () => {
      // TODO: コンフリクト解決ダイアログを表示
      console.warn("Conflicts detected, need to implement resolution UI");
    },
  });

  // 取り消し/やり直しフック
  const {
    canUndo,
    canRedo,
    undo: undoAction,
    redo: redoAction,
    pushHistory,
    getLastUndo,
    getLastRedo,
    undoHistory,
    redoHistory,
  } = useUndoRedo({
    maxHistorySize: 50,
    onUndo: async (entry) => {
      // 取り消し時は逆の操作を適用
      const undoUpdates = entry.updates.map((update) => {
        const previousShift = shiftDataMap
          .get(update.staffId)
          ?.get(update.date);
        return {
          ...update,
          newState: previousShift?.state,
          isLocked: previousShift?.isLocked,
        };
      });

      // セル単位の変更履歴を記録（undo）
      recordBatchCellChanges(
        undoUpdates,
        currentUserId,
        currentUserName,
        "undo",
      );

      await batchUpdateShiftsWithOfflineSupport(undoUpdates);
    },
    onRedo: async (entry) => {
      // セル単位の変更履歴を記録（redo）
      recordBatchCellChanges(
        entry.updates,
        currentUserId,
        currentUserName,
        "redo",
      );

      // やり直し時は元の操作を再適用
      await batchUpdateShiftsWithOfflineSupport(entry.updates);
    },
  });

  // プレゼンス管理フック
  const {
    activeUsers,
    editingCells,
    startEditingCell,
    stopEditingCell,
    isCellBeingEdited,
    getCellEditor,
    updateActivity,
    forceReleaseCell,
    getAllEditingCells,
  } = useShiftPresence({
    currentUserId,
    currentUserName,
    shiftRequestId,
    targetMonth,
  });

  /**
   * シフトセルを更新
   */
  const handleUpdateShift = useCallback(
    async (update: ShiftCellUpdate) => {
      // アクティビティを記録
      updateActivity();

      // 編集中の通知を停止
      stopEditingCell(update.staffId, update.date);

      // 履歴に追加
      pushHistory(
        [update],
        `${update.staffId} の ${update.date} のシフトを更新`,
        { userId: currentUserId, userName: currentUserName },
      );

      // セル単位の変更履歴を記録
      recordCellChange(update, currentUserId, currentUserName, "manual");

      // オフライン対応の更新を実行
      await updateShiftWithOfflineSupport(update);
    },
    [
      updateActivity,
      stopEditingCell,
      pushHistory,
      recordCellChange,
      updateShiftWithOfflineSupport,
      currentUserId,
      currentUserName,
    ],
  );

  /**
   * バッチ更新
   */
  const handleBatchUpdateShifts = useCallback(
    async (updates: ShiftCellUpdate[]) => {
      updateActivity();

      // すべての編集中通知を停止
      updates.forEach((update) => {
        stopEditingCell(update.staffId, update.date);
      });

      // 履歴に追加
      pushHistory(updates, `${updates.length} 件のシフトを一括更新`, {
        userId: currentUserId,
        userName: currentUserName,
      });

      // セル単位の変更履歴を一括記録
      recordBatchCellChanges(updates, currentUserId, currentUserName, "batch");

      // オフライン対応のバッチ更新を実行
      await batchUpdateShiftsWithOfflineSupport(updates);
    },
    [
      updateActivity,
      stopEditingCell,
      pushHistory,
      recordBatchCellChanges,
      batchUpdateShiftsWithOfflineSupport,
      currentUserId,
      currentUserName,
    ],
  );

  /**
   * セルの選択状態をトグル
   */
  const handleToggleCellSelection = useCallback(
    (cellKey: string, selected: boolean) => {
      setSelectedCells((prev) => {
        const next = new Set(prev);
        if (selected) {
          next.add(cellKey);
        } else {
          next.delete(cellKey);
        }
        return next;
      });
    },
    [],
  );

  /**
   * セルの編集開始
   */
  const handleStartEditingCell = useCallback(
    (staffId: string, date: string) => {
      updateActivity();
      startEditingCell(staffId, date);
    },
    [updateActivity, startEditingCell],
  );

  /**
   * セルの編集終了（更新なし）
   */
  const handleStopEditingCell = useCallback(
    (staffId: string, date: string) => {
      stopEditingCell(staffId, date);
    },
    [stopEditingCell],
  );

  /**
   * ユーザーアクティビティの記録
   */
  const handleUpdateUserActivity = useCallback(() => {
    updateActivity();
  }, [updateActivity]);

  /**
   * 手動同期
   */
  const handleTriggerSync = useCallback(async () => {
    await triggerSync();
  }, [triggerSync]);

  /**
   * コメント追加
   */
  const handleAddComment = useCallback(
    async (
      cellKey: string,
      content: string,
      mentions: Mention[],
    ): Promise<CellComment> => {
      const comment = addComment(
        cellKey,
        currentUserId,
        currentUserName,
        activeUsers.find((u) => u.userId === currentUserId)?.color || "#1976d2",
        content,
        mentions,
      );

      // cellKey は "staffId#date" 形式
      const staffId = cellKey.split("#")[0];
      await persistComments(staffId);

      return comment;
    },
    [addComment, currentUserId, currentUserName, activeUsers, persistComments],
  );

  /**
   * コメント更新
   */
  const handleUpdateComment = useCallback(
    async (
      commentId: string,
      content: string,
      mentions: Mention[],
    ): Promise<CellComment> => {
      const updated = updateComment(commentId, content, mentions);
      if (!updated) {
        throw new Error(`Comment ${commentId} not found`);
      }

      const staffId = updated.cellKey.split("#")[0];
      await persistComments(staffId);

      return updated;
    },
    [updateComment, persistComments],
  );

  /**
   * コメント削除
   */
  const handleDeleteComment = useCallback(
    async (commentId: string): Promise<void> => {
      const { cellKey } = deleteComment(commentId);
      if (cellKey) {
        const staffId = cellKey.split("#")[0];
        await persistComments(staffId);
      }
    },
    [deleteComment, persistComments],
  );

  /**
   * セルのコメント取得
   */
  const handleGetCommentsByCell = useCallback(
    (cellKey: string): CellComment[] => {
      return getCommentsByCell(cellKey);
    },
    [getCommentsByCell],
  );

  /**
   * コメントに返信
   */
  const handleReplyToComment = useCallback(
    async (
      parentCommentId: string,
      content: string,
      mentions: Mention[],
    ): Promise<CellComment> => {
      const reply = replyToComment(
        parentCommentId,
        currentUserId,
        currentUserName,
        activeUsers.find((u) => u.userId === currentUserId)?.color || "#1976d2",
        content,
        mentions,
      );
      if (!reply) {
        throw new Error(`Parent comment ${parentCommentId} not found`);
      }

      const staffId = reply.cellKey.split("#")[0];
      await persistComments(staffId);

      return reply;
    },
    [
      replyToComment,
      currentUserId,
      currentUserName,
      activeUsers,
      persistComments,
    ],
  );

  /**
   * 返信削除
   */
  const handleDeleteCommentReply = useCallback(
    async (parentCommentId: string, replyCommentId: string): Promise<void> => {
      deleteCommentReply(parentCommentId, replyCommentId);
    },
    [deleteCommentReply],
  );

  /**
   * 状態をまとめる
   */
  const state: CollaborativeShiftState = useMemo(
    () => ({
      shiftDataMap,
      activeUsers,
      editingCells,
      pendingChanges,
      selectedCells,
      isLoading,
      isSyncing,
      lastSyncedAt,
      lastAutoSyncedAt,
      dataStatus,
      error: error || syncError || null,
      connectionState,
      isOnline,
      hasPendingChanges,
      lastRemoteUpdate,
    }),
    [
      shiftDataMap,
      activeUsers,
      editingCells,
      pendingChanges,
      selectedCells,
      isLoading,
      isSyncing,
      lastSyncedAt,
      lastAutoSyncedAt,
      dataStatus,
      error,
      syncError,
      connectionState,
      isOnline,
      hasPendingChanges,
      lastRemoteUpdate,
    ],
  );

  const contextValue: CollaborativeShiftContextType = useMemo(
    () => ({
      state,
      updateShift: handleUpdateShift,
      batchUpdateShifts: handleBatchUpdateShifts,
      isBatchUpdating,
      toggleCellSelection: handleToggleCellSelection,
      startEditingCell: handleStartEditingCell,
      stopEditingCell: handleStopEditingCell,
      isCellBeingEdited,
      getCellEditor,
      forceReleaseCell,
      getAllEditingCells,
      triggerSync: handleTriggerSync,
      clearSyncError,
      updateUserActivity: handleUpdateUserActivity,
      retryPendingChanges,
      syncPendingChanges,
      // Undo/Redo
      canUndo,
      canRedo,
      undo: undoAction,
      redo: redoAction,
      getLastUndo,
      getLastRedo,
      undoHistory,
      redoHistory,
      showHistory,
      toggleHistory: () => setShowHistory((prev) => !prev),
      // セル単位変更履歴
      getCellHistory,
      getAllCellHistory,
      getStaffCellHistory,
      // Comments
      addComment: handleAddComment,
      updateComment: handleUpdateComment,
      deleteComment: handleDeleteComment,
      getCommentsByCell: handleGetCommentsByCell,
      replyToComment: handleReplyToComment,
      deleteCommentReply: handleDeleteCommentReply,
    }),
    [
      state,
      handleUpdateShift,
      handleBatchUpdateShifts,
      isBatchUpdating,
      handleToggleCellSelection,
      handleStartEditingCell,
      handleStopEditingCell,
      isCellBeingEdited,
      getCellEditor,
      forceReleaseCell,
      getAllEditingCells,
      handleTriggerSync,
      clearSyncError,
      handleUpdateUserActivity,
      retryPendingChanges,
      syncPendingChanges,
      canUndo,
      canRedo,
      undoAction,
      redoAction,
      getLastUndo,
      getLastRedo,
      undoHistory,
      redoHistory,
      showHistory,
      getCellHistory,
      getAllCellHistory,
      getStaffCellHistory,
      handleAddComment,
      handleUpdateComment,
      handleDeleteComment,
      handleGetCommentsByCell,
      handleReplyToComment,
      handleDeleteCommentReply,
    ],
  );

  return (
    <CollaborativeShiftContext.Provider value={contextValue}>
      {children}
    </CollaborativeShiftContext.Provider>
  );
};
