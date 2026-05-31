import { useCallback, useMemo } from "react";

import {
  CellChangeRecord,
  CellChangeSource,
  EditLockAcquireResult,
  ShiftCellUpdate,
  ShiftState,
} from "../types/collaborative.types";

interface UseShiftOperationsProps {
  currentUserId: string;
  currentUserName: string;
  shiftDataMapRef: React.MutableRefObject<Map<string, Map<string, { state: ShiftState; isLocked: boolean }>>>;
  updateActivity: () => void;
  recordCellChange: (update: ShiftCellUpdate, userId: string, userName: string, source: CellChangeSource) => CellChangeRecord;
  recordBatchCellChanges: (updates: ShiftCellUpdate[], userId: string, userName: string, source: CellChangeSource) => { operationId: string; records: CellChangeRecord[] };
  updateShift: (update: ShiftCellUpdate) => Promise<void>;
  batchUpdateShifts: (updates: ShiftCellUpdate[]) => Promise<void>;
  acquireEditLock: (staffId: string, date: string) => Promise<EditLockAcquireResult>;
  releaseEditLock: (staffId: string, date: string) => Promise<void>;
  forceReleaseLock: (staffId: string, date: string) => Promise<void>;
  triggerSync: () => Promise<void>;
  setSelectedCells: React.Dispatch<React.SetStateAction<Set<string>>>;
}

interface ShiftOperations {
  updateShift: (update: ShiftCellUpdate) => Promise<void>;
  batchUpdateShifts: (updates: ShiftCellUpdate[]) => Promise<void>;
  toggleCellSelection: (cellKey: string, selected: boolean) => void;
  startEditingCell: (staffId: string, date: string) => Promise<EditLockAcquireResult>;
  stopEditingCell: (staffId: string, date: string) => Promise<void>;
  forceReleaseCell: (staffId: string, date: string) => Promise<void>;
  updateUserActivity: () => void;
  triggerSync: () => Promise<void>;
}

/**
 * シフト操作（編集・ロック・同期・セル選択）のハンドラーを統合管理
 */
export const useShiftOperations = ({
  currentUserId,
  currentUserName,
  shiftDataMapRef,
  updateActivity,
  recordCellChange,
  recordBatchCellChanges,
  updateShift,
  batchUpdateShifts,
  acquireEditLock,
  releaseEditLock,
  forceReleaseLock,
  triggerSync,
  setSelectedCells,
}: UseShiftOperationsProps): ShiftOperations => {
  const enrichShiftUpdate = useCallback((update: ShiftCellUpdate): ShiftCellUpdate => {
    const currentCellData = shiftDataMapRef.current.get(update.staffId)?.get(update.date);
    return {
      ...update,
      previousState: update.previousState ?? currentCellData?.state,
      previousLocked: update.previousLocked ?? currentCellData?.isLocked,
    };
  }, [shiftDataMapRef]);

  const updateShiftHandler = useCallback(
    async (update: ShiftCellUpdate) => {
      updateActivity();
      recordCellChange(enrichShiftUpdate(update), currentUserId, currentUserName, "manual");
      await updateShift(update);
    },
    [updateActivity, recordCellChange, updateShift, currentUserId, currentUserName, enrichShiftUpdate],
  );

  const batchUpdateShiftsHandler = useCallback(
    async (updates: ShiftCellUpdate[]) => {
      updateActivity();
      recordBatchCellChanges(updates.map(enrichShiftUpdate), currentUserId, currentUserName, "batch");
      await batchUpdateShifts(updates);
    },
    [updateActivity, recordBatchCellChanges, batchUpdateShifts, currentUserId, currentUserName, enrichShiftUpdate],
  );

  const toggleCellSelection = useCallback(
    (cellKey: string, selected: boolean) => {
      setSelectedCells((prev) => {
        const next = new Set(prev);
        if (selected) { next.add(cellKey); } else { next.delete(cellKey); }
        return next;
      });
    },
    [setSelectedCells],
  );

  const startEditingCell = useCallback(
    async (staffId: string, date: string) => { updateActivity(); return acquireEditLock(staffId, date); },
    [updateActivity, acquireEditLock],
  );

  const stopEditingCell = useCallback(
    async (staffId: string, date: string) => releaseEditLock(staffId, date),
    [releaseEditLock],
  );

  const forceReleaseCell = useCallback(
    async (staffId: string, date: string) => forceReleaseLock(staffId, date),
    [forceReleaseLock],
  );

  const updateUserActivity = useCallback(() => updateActivity(), [updateActivity]);

  const triggerSyncHandler = useCallback(async () => triggerSync(), [triggerSync]);

  return useMemo(
    () => ({
      updateShift: updateShiftHandler,
      batchUpdateShifts: batchUpdateShiftsHandler,
      toggleCellSelection,
      startEditingCell,
      stopEditingCell,
      forceReleaseCell,
      updateUserActivity,
      triggerSync: triggerSyncHandler,
    }),
    [
      updateShiftHandler, batchUpdateShiftsHandler, toggleCellSelection,
      startEditingCell, stopEditingCell, forceReleaseCell,
      updateUserActivity, triggerSyncHandler,
    ],
  );
};
