import React, { useCallback, useMemo, useState } from "react";

import {
  CollaborativeShiftContext,
  CollaborativeShiftContextType,
} from "../context/CollaborativeShiftContext";
import { useCollaborativeShiftData } from "../hooks/useCollaborativeShiftData";
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
    error,
    connectionState,
    fetchShifts,
    updateShift,
  } = useCollaborativeShiftData({
    staffIds,
    _targetMonth: targetMonth,
    currentUserId,
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
  } = useShiftPresence({
    currentUserId,
    currentUserName,
    _shiftRequestId: shiftRequestId,
    _targetMonth: targetMonth,
  });

  // 同期フック
  const { isSyncing, lastSyncedAt, syncError, triggerSync, pause, resume } =
    useShiftSync({
      enabled: true,
      interval: 5000, // 5秒ごとに同期
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

      // 更新を実行
      await updateShift(update);
    },
    [updateActivity, stopEditingCell, updateShift]
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

      // TODO: バッチ更新APIの実装
      // 現在は個別に更新
      for (const update of updates) {
        await updateShift(update);
      }
    },
    [updateActivity, stopEditingCell, updateShift]
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
    []
  );

  /**
   * セルの編集開始
   */
  const handleStartEditingCell = useCallback(
    (staffId: string, date: string) => {
      updateActivity();
      startEditingCell(staffId, date);
    },
    [updateActivity, startEditingCell]
  );

  /**
   * セルの編集終了（更新なし）
   */
  const handleStopEditingCell = useCallback(
    (staffId: string, date: string) => {
      stopEditingCell(staffId, date);
    },
    [stopEditingCell]
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
    ]
  );

  const contextValue: CollaborativeShiftContextType = useMemo(
    () => ({
      state,
      updateShift: handleUpdateShift,
      batchUpdateShifts: handleBatchUpdateShifts,
      toggleCellSelection: handleToggleCellSelection,
      startEditingCell: handleStartEditingCell,
      stopEditingCell: handleStopEditingCell,
      isCellBeingEdited,
      getCellEditor,
      triggerSync: handleTriggerSync,
      pauseSync: pause,
      resumeSync: resume,
      updateUserActivity: handleUpdateUserActivity,
    }),
    [
      state,
      handleUpdateShift,
      handleBatchUpdateShifts,
      handleToggleCellSelection,
      handleStartEditingCell,
      handleStopEditingCell,
      isCellBeingEdited,
      getCellEditor,
      handleTriggerSync,
      pause,
      resume,
      handleUpdateUserActivity,
    ]
  );

  return (
    <CollaborativeShiftContext.Provider value={contextValue}>
      {children}
    </CollaborativeShiftContext.Provider>
  );
};
