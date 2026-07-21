import { createLogger } from "@shared/lib/logger";
import { useCallback } from "react";

import type { ShiftState } from "../../types/collaborative.types";
import { buildEditLockConflictMessage } from "../useShiftEditLocks";

const logger = createLogger("CellStateActions");

type CellPosition = {
  staffId: string;
  date: string;
};

export type AppliedStateChange = {
  staffId: string;
  date: string;
  previousState: ShiftState | undefined;
  newState: ShiftState;
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
  getCellState: (staffId: string, date: string) => ShiftState | undefined;
  updateUserActivity: () => void;
  updateShift: (payload: {
    staffId: string;
    date: string;
    newState: ShiftState;
  }) => Promise<void>;
  batchUpdateShifts: (
    updates: Array<{ staffId: string; date: string; newState?: ShiftState }>,
  ) => Promise<void>;
  onStateChanged?: (changes: AppliedStateChange[]) => Promise<void> | void;
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
  getCellState,
  updateUserActivity,
  updateShift,
  batchUpdateShifts,
  onStateChanged,
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
      const previousState = getCellState(staffId, date);
      updateUserActivity();
      await updateShift({ staffId, date, newState });

      if (previousState === newState) {
        return null;
      }

      return {
        staffId,
        date,
        previousState,
        newState,
      } satisfies AppliedStateChange;
    },
    [
      getCellState,
      getCellEditor,
      hasEditLock,
      isCellBeingEdited,
      isCellLocked,
      isEditingDisabled,
      networkEditDisabledMessage,
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
            const changed = await changeCellState(staffId, date, newState);
            if (changed) {
              await onStateChanged?.([changed]);
            }
            return;
          }

          if (selectionCount > 1) {
            const updates = selectedCells.map(({ staffId, date }) => ({
              staffId,
              date,
              newState,
            }));
            const validUpdates = updates.filter((u) =>
              hasEditLock(u.staffId, u.date),
            );
            if (validUpdates.length > 0) {
              const previousStates = new Map(
                validUpdates.map((update) => [
                  `${update.staffId}#${update.date}`,
                  getCellState(update.staffId, update.date),
                ]),
              );

              setEditLockError(null);
              updateUserActivity();
              await batchUpdateShifts(validUpdates);

              const changed = validUpdates
                .map((update) => {
                  const previousState = previousStates.get(
                    `${update.staffId}#${update.date}`,
                  );

                  if (previousState === newState) {
                    return null;
                  }

                  return {
                    staffId: update.staffId,
                    date: update.date,
                    previousState,
                    newState,
                  } satisfies AppliedStateChange;
                })
                .filter((value): value is AppliedStateChange => value !== null);

              if (changed.length > 0) {
                await onStateChanged?.(changed);
              }
            } else {
              setEditLockError(
                "一括編集前に対象セルのロックを取得してください。",
              );
            }
            return;
          }

          if (focusedCell) {
            const changed = await changeCellState(
              focusedCell.staffId,
              focusedCell.date,
              newState,
            );
            if (changed) {
              await onStateChanged?.([changed]);
            }
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
      getCellState,
      isEditingDisabled,
      networkEditDisabledMessage,
      onStateChanged,
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
