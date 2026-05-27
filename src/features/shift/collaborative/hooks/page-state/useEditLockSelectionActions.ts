import { useCallback, useMemo } from "react";

import { buildEditLockConflictMessage } from "../useShiftEditLocks";

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

type UseEditLockSelectionActionsParams = {
  selectionTargets: CellPosition[];
  isEditingDisabled: boolean;
  targetMonth: string;
  isAdmin: boolean;
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
  forceReleaseCell: (staffId: string, date: string) => Promise<void>;
  networkEditDisabledMessage: string;
  setEditLockError: (error: string | null) => void;
};

export const useEditLockSelectionActions = ({
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
}: UseEditLockSelectionActionsParams) => {
  const hasEditLockForSelected = useMemo(
    () =>
      selectionTargets.length > 0 &&
      selectionTargets.every((t) => hasEditLock(t.staffId, t.date)),
    [selectionTargets, hasEditLock],
  );

  const isOthersEditingSelected = useMemo(
    () => selectionTargets.some((t) => isCellBeingEdited(t.staffId, t.date)),
    [selectionTargets, isCellBeingEdited],
  );

  const applyEditLock = useCallback(
    async (acquire: boolean) => {
      if (isEditingDisabled) {
        setEditLockError(networkEditDisabledMessage);
        return;
      }

      if (selectionTargets.length === 0) {
        return;
      }

      if (acquire) {
        await refreshLocks();
      }

      const conflicts: string[] = [];
      for (const { staffId, date } of selectionTargets) {
        if (acquire) {
          if (isCellBeingEdited(staffId, date)) {
            const editor = getCellEditor(staffId, date);
            conflicts.push(
              buildEditLockConflictMessage({
                id: "",
                targetMonth,
                staffId,
                date,
                holderUserId: editor?.userId ?? "",
                holderUserName: editor?.userName ?? "他のユーザー",
                acquiredAt: new Date().toISOString(),
                expiresAt: new Date().toISOString(),
                version: 0,
              }),
            );
            continue;
          }

          if (hasEditLock(staffId, date)) {
            continue;
          }

          const result = await startEditingCell(staffId, date);
          if (!result.acquired) {
            conflicts.push(buildEditLockConflictMessage(result.conflict));
          }
        } else if (hasEditLock(staffId, date)) {
          await stopEditingCell(staffId, date);
        }
      }

      setEditLockError(conflicts.length > 0 ? conflicts[0] : null);
    },
    [
      getCellEditor,
      hasEditLock,
      isCellBeingEdited,
      isEditingDisabled,
      networkEditDisabledMessage,
      refreshLocks,
      selectionTargets,
      setEditLockError,
      startEditingCell,
      stopEditingCell,
      targetMonth,
    ],
  );

  const handleAcquireEditLock = useCallback(() => {
    void applyEditLock(true);
  }, [applyEditLock]);

  const handleReleaseEditLock = useCallback(() => {
    void applyEditLock(false);
  }, [applyEditLock]);

  const handleForceReleaseLock = useCallback(() => {
    if (!isAdmin) return;
    selectionTargets.forEach(({ staffId, date }) => {
      void forceReleaseCell(staffId, date);
    });
  }, [forceReleaseCell, isAdmin, selectionTargets]);

  return {
    hasEditLockForSelected,
    isOthersEditingSelected,
    handleAcquireEditLock,
    handleReleaseEditLock,
    handleForceReleaseLock,
  };
};
