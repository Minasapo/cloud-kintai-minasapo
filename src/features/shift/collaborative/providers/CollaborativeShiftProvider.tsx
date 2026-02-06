import React, { useCallback, useMemo, useState } from "react";

import {
  CollaborativeShiftContext,
  CollaborativeShiftContextType,
} from "../context/CollaborativeShiftContext";
import { useCollaborativeShiftData } from "../hooks/useCollaborativeShiftData";
import { useCollaborativeShiftOffline } from "../hooks/useCollaborativeShiftOffline";
import { useShiftPresence } from "../hooks/useShiftPresence";
import { useShiftSync } from "../hooks/useShiftSync";
import {
  CollaborativeShiftState,
  ShiftCellUpdate,
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
  } = useCollaborativeShiftData({
    staffIds,
    targetMonth,
    currentUserId,
  });

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
    _shiftRequestId: shiftRequestId,
    _targetMonth: targetMonth,
  });

  // 同期フック
  const { isSyncing, lastSyncedAt, syncError, triggerSync, pause, resume } =
    useShiftSync({
      enabled: false, // Phase 1.1では自動同期は不要（ユーザーアクションで都度更新）
      interval: 5000,
      onSync: async () => {
        await fetchShifts();
      },
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

      // オフライン対応の更新を実行
      await updateShiftWithOfflineSupport(update);
    },
    [updateActivity, stopEditingCell, updateShiftWithOfflineSupport],
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

      // オフライン対応のバッチ更新を実行
      await batchUpdateShiftsWithOfflineSupport(updates);
    },
    [updateActivity, stopEditingCell, batchUpdateShiftsWithOfflineSupport],
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
      error: error || syncError || null,
      connectionState,
      isOnline,
      hasPendingChanges,
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
      error,
      syncError,
      connectionState,
      isOnline,
      hasPendingChanges,
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
      pauseSync: pause,
      resumeSync: resume,
      updateUserActivity: handleUpdateUserActivity,
      retryPendingChanges,
      syncPendingChanges,
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
      pause,
      resume,
      handleUpdateUserActivity,
      retryPendingChanges,
      syncPendingChanges,
    ],
  );

  return (
    <CollaborativeShiftContext.Provider value={contextValue}>
      {children}
    </CollaborativeShiftContext.Provider>
  );
};
