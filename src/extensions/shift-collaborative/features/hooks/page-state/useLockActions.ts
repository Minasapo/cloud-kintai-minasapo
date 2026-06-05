import { useCallback, useMemo } from "react";

import { useEditLockSelectionActions } from "./useEditLockSelectionActions";

type CellPosition = {
  staffId: string;
  date: string;
};

type EditLockAcquireResult = {
  acquired: boolean;
  conflict?: {
    id: string;
    targetMonth: string;
    staffId: string;
    date: string;
    holderUserId: string;
    holderUserName: string;
    acquiredAt: string;
    expiresAt: string;
    version: number;
  };
};

type LockUpdate = {
  staffId: string;
  date: string;
  isLocked: boolean;
};

type ShiftCellData = {
  state: string;
  isLocked: boolean;
};

type UseLockActionsParams = {
  selectionCount: number;
  selectedCells: CellPosition[];
  focusedCell: CellPosition | null;
  getCellData: (staffId: string, date: string) => ShiftCellData | undefined;
  dateKeys: string[];
  shiftDataMap: Map<string, Map<string, ShiftCellData>>;
  isEditingDisabled: boolean;
  isAdmin: boolean;
  targetMonth: string;
  hasEditLock: (staffId: string, date: string) => boolean;
  isCellBeingEdited: (staffId: string, date: string) => boolean;
  getCellEditor: (
    staffId: string,
    date: string,
  ) => { userId?: string; userName?: string } | undefined;
  startEditingCell: (
    staffId: string,
    date: string,
  ) => Promise<EditLockAcquireResult>;
  stopEditingCell: (staffId: string, date: string) => Promise<void>;
  refreshLocks: () => Promise<unknown>;
  batchUpdateShifts: (
    updates: Array<{ staffId: string; date: string; isLocked?: boolean }>,
  ) => Promise<void>;
  forceReleaseCell: (staffId: string, date: string) => Promise<void>;
  networkEditDisabledMessage: string;
  setEditLockError: (error: string | null) => void;
};

export const useLockActions = ({
  selectionCount,
  selectedCells,
  focusedCell,
  getCellData,
  dateKeys,
  shiftDataMap,
  isEditingDisabled,
  isAdmin,
  targetMonth,
  hasEditLock,
  isCellBeingEdited,
  getCellEditor,
  startEditingCell,
  stopEditingCell,
  refreshLocks,
  batchUpdateShifts,
  forceReleaseCell,
  networkEditDisabledMessage,
  setEditLockError,
}: UseLockActionsParams) => {
  const ensureLockOperationAllowed = useCallback(
    (requiresAdmin: boolean = true) => {
      if (isEditingDisabled) {
        setEditLockError(networkEditDisabledMessage);
        return false;
      }
      if (requiresAdmin && !isAdmin) {
        return false;
      }
      return true;
    },
    [
      isAdmin,
      isEditingDisabled,
      networkEditDisabledMessage,
      setEditLockError,
    ],
  );

  const submitLockUpdates = useCallback(
    (updates: LockUpdate[]) => {
      if (updates.length === 0) {
        return;
      }
      void batchUpdateShifts(updates);
    },
    [batchUpdateShifts],
  );

  const selectionTargets = useMemo(() => {
    if (selectionCount > 0) {
      return selectedCells;
    }
    if (focusedCell) {
      return [focusedCell];
    }
    return [];
  }, [selectionCount, selectedCells, focusedCell]);

  const applyLockState = useCallback(
    (locked: boolean) => {
      if (!ensureLockOperationAllowed()) {
        return;
      }

      const updates = selectionTargets
        .map(({ staffId, date }) => {
          const cell = getCellData(staffId, date);
          if (!cell || cell.isLocked === locked) return null;
          return { staffId, date, isLocked: locked };
        })
        .filter((update): update is LockUpdate => update !== null);
      submitLockUpdates(updates);
    },
    [ensureLockOperationAllowed, selectionTargets, getCellData, submitLockUpdates],
  );

  const applyLockStateForStaff = useCallback(
    (staffId: string, locked: boolean) => {
      if (!ensureLockOperationAllowed()) {
        return;
      }

      const staffData = shiftDataMap.get(staffId);
      if (!staffData) return;

      const updates = dateKeys
        .map((date) => {
          const cell = staffData.get(date);
          if (!cell || cell.state === "empty" || cell.isLocked === locked) {
            return null;
          }
          return { staffId, date, isLocked: locked };
        })
        .filter((update): update is LockUpdate => update !== null);
      submitLockUpdates(updates);
    },
    [
      dateKeys,
      ensureLockOperationAllowed,
      shiftDataMap,
      submitLockUpdates,
    ],
  );

  const applyLockStateForMonth = useCallback(
    (locked: boolean) => {
      if (!ensureLockOperationAllowed()) {
        return;
      }

      const updates: LockUpdate[] = [];
      for (const [staffId, staffData] of shiftDataMap) {
        for (const date of dateKeys) {
          const cell = staffData.get(date);
          if (cell && cell.state !== "empty" && cell.isLocked !== locked) {
            updates.push({ staffId, date, isLocked: locked });
          }
        }
      }
      submitLockUpdates(updates);
    },
    [
      dateKeys,
      ensureLockOperationAllowed,
      shiftDataMap,
      submitLockUpdates,
    ],
  );

  const hasLocked = useMemo(
    () => selectionTargets.some((t) => getCellData(t.staffId, t.date)?.isLocked),
    [selectionTargets, getCellData],
  );

  const hasUnlocked = useMemo(
    () => selectionTargets.some((t) => !getCellData(t.staffId, t.date)?.isLocked),
    [selectionTargets, getCellData],
  );

  const {
    hasEditLockForSelected,
    isOthersEditingSelected,
    handleAcquireEditLock,
    handleReleaseEditLock,
    handleForceReleaseLock,
  } = useEditLockSelectionActions({
    selectionTargets,
    isEditingDisabled,
    targetMonth,
    isAdmin,
    hasEditLock,
    isCellBeingEdited,
    getCellEditor,
    startEditingCell,
    stopEditingCell,
    refreshLocks,
    forceReleaseCell,
    networkEditDisabledMessage,
    setEditLockError,
  });

  const clearEditLockError = useCallback(() => {
    setEditLockError(null);
  }, [setEditLockError]);

  const handleLockCells = useCallback(() => {
    applyLockState(true);
  }, [applyLockState]);

  const handleUnlockCells = useCallback(() => {
    applyLockState(false);
  }, [applyLockState]);

  const handleLockStaffRow = useCallback(
    (staffId: string) => applyLockStateForStaff(staffId, true),
    [applyLockStateForStaff],
  );

  const handleUnlockStaffRow = useCallback(
    (staffId: string) => applyLockStateForStaff(staffId, false),
    [applyLockStateForStaff],
  );

  const handleLockMonth = useCallback(() => {
    applyLockStateForMonth(true);
  }, [applyLockStateForMonth]);

  const handleUnlockMonth = useCallback(() => {
    applyLockStateForMonth(false);
  }, [applyLockStateForMonth]);

  return {
    hasLocked,
    hasUnlocked,
    hasEditLockForSelected,
    isOthersEditingSelected,
    clearEditLockError,
    handleLockCells,
    handleUnlockCells,
    handleLockStaffRow,
    handleUnlockStaffRow,
    handleLockMonth,
    handleUnlockMonth,
    handleAcquireEditLock,
    handleReleaseEditLock,
    handleForceReleaseLock,
  };
};
