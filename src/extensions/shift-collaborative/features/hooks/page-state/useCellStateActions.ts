import { createLogger } from "@shared/lib/logger";
import { useCallback } from "react";

import type { ShiftState } from "../../types/collaborative.types";
import { buildEditLockConflictMessage } from "../useShiftEditLocks";

const logger = createLogger("CellStateActions");

type CellPosition = {
  staffId: string;
  date: string;
};

type UseCellStateActionsParams = {
  targetMonth: string;
  isEditingDisabled: boolean;
  setEditLockError: (error: string | null) => void;
  networkEditDisabledMessage: string;
  isCellLocked: (staffId: string, date: string) => boolean;
  isCellBeingEdited: (staffId: string, date: string) => boolean;
  getCellEditor: (
    staffId: string,
    date: string,
  ) => { userId?: string; userName?: string } | undefined;
  hasEditLock: (staffId: string, date: string) => boolean;
  updateUserActivity: () => void;
  updateShift: (payload: {
    staffId: string;
    date: string;
    newState: ShiftState;
  }) => Promise<void>;
  batchUpdateShifts: (
    updates: Array<{ staffId: string; date: string; newState?: ShiftState }>,
  ) => Promise<void>;
  releaseEditLocks: (targets: Array<{ staffId: string; date: string }>) => Promise<void>;
  selectionCount: number;
  selectedCells: CellPosition[];
  focusedCell: CellPosition | null;
};

export const useCellStateActions = ({
  targetMonth,
  isEditingDisabled,
  setEditLockError,
  networkEditDisabledMessage,
  isCellLocked,
  isCellBeingEdited,
  getCellEditor,
  hasEditLock,
  updateUserActivity,
  updateShift,
  batchUpdateShifts,
  releaseEditLocks,
  selectionCount,
  selectedCells,
  focusedCell,
}: UseCellStateActionsParams) => {
  const changeCellState = useCallback(
    async (staffId: string, date: string, newState: ShiftState) => {
      if (isEditingDisabled) {
        setEditLockError(networkEditDisabledMessage);
        return false;
      }

      if (isCellLocked(staffId, date)) {
        setEditLockError("確定済みのセルは変更できません。");
        return false;
      }

      if (isCellBeingEdited(staffId, date)) {
        const editor = getCellEditor(staffId, date);
        setEditLockError(
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
        return false;
      }

      if (!hasEditLock(staffId, date)) {
        setEditLockError("編集前にロックを取得してください。");
        return false;
      }

      setEditLockError(null);
      updateUserActivity();
      await updateShift({ staffId, date, newState });
      await releaseEditLocks([{ staffId, date }]);
      return true;
    },
    [
      getCellEditor,
      hasEditLock,
      isCellBeingEdited,
      isCellLocked,
      isEditingDisabled,
      networkEditDisabledMessage,
      releaseEditLocks,
      setEditLockError,
      targetMonth,
      updateShift,
      updateUserActivity,
    ],
  );

  const handleChangeState = useCallback(
    (newState: ShiftState) => {
      const run = async () => {
        try {
          if (isEditingDisabled) {
            setEditLockError(networkEditDisabledMessage);
            return;
          }

          if (selectionCount === 1) {
            const [{ staffId, date }] = selectedCells;
            if (!staffId || !date) {
              return;
            }
            await changeCellState(staffId, date, newState);
            return;
          }

          if (selectionCount > 1) {
            const updates = selectedCells.map(({ staffId, date }) => ({
              staffId,
              date,
              newState,
            }));
            const validUpdates = updates.filter((u) => hasEditLock(u.staffId, u.date));
            if (validUpdates.length > 0) {
              setEditLockError(null);
              updateUserActivity();
              await batchUpdateShifts(validUpdates);
              await releaseEditLocks(validUpdates);
            } else {
              setEditLockError("一括編集前に対象セルのロックを取得してください。");
            }
            return;
          }

          if (focusedCell) {
            await changeCellState(focusedCell.staffId, focusedCell.date, newState);
          }
        } catch (error) {
          logger.error("Failed to change shift state:", error);
        }
      };

      void run();
    },
    [
      batchUpdateShifts,
      changeCellState,
      focusedCell,
      hasEditLock,
      isEditingDisabled,
      networkEditDisabledMessage,
      releaseEditLocks,
      selectedCells,
      selectionCount,
      setEditLockError,
      updateUserActivity,
    ],
  );

  return {
    changeCellState,
    handleChangeState,
  };
};
