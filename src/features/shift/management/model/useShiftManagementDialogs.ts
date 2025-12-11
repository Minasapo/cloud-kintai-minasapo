import { useCallback, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import * as MESSAGE_CODE from "@/errors";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

import { ShiftState } from "../lib/generateMockShifts";

export type ShiftEditingTarget = {
  staffId: string;
  staffName: string;
  dateKey: string;
};

export type ApplyShiftStateFn = (
  staffIds: string[],
  dayKeys: string[],
  nextState: ShiftState
) => Promise<void>;

export default function useShiftManagementDialogs(
  applyShiftState: ApplyShiftStateFn
) {
  const dispatch = useAppDispatchV2();
  const [editingCell, setEditingCell] = useState<ShiftEditingTarget | null>(
    null
  );
  const [editingState, setEditingState] = useState<ShiftState>("auto");
  const [isSavingSingleEdit, setIsSavingSingleEdit] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkEditState, setBulkEditState] = useState<ShiftState>("work");
  const [isSavingBulkEdit, setIsSavingBulkEdit] = useState(false);

  const openShiftEditDialog = useCallback(
    (target: ShiftEditingTarget, state: ShiftState) => {
      setEditingCell(target);
      setEditingState(state);
    },
    []
  );

  const closeShiftEditDialog = useCallback(() => {
    setEditingCell(null);
  }, []);

  const handleEditingStateChange = useCallback((state: ShiftState) => {
    setEditingState(state);
  }, []);

  const saveShiftEdit = useCallback(async () => {
    if (!editingCell) return;
    setIsSavingSingleEdit(true);
    try {
      const { staffId, dateKey } = editingCell;
      await applyShiftState([staffId], [dateKey], editingState);
      dispatch(setSnackbarSuccess(MESSAGE_CODE.S16001));
      closeShiftEditDialog();
    } catch (error) {
      console.error("Failed to save shift edit", error);
      dispatch(setSnackbarError(MESSAGE_CODE.E16001));
    } finally {
      setIsSavingSingleEdit(false);
    }
  }, [
    applyShiftState,
    closeShiftEditDialog,
    dispatch,
    editingCell,
    editingState,
  ]);

  const openBulkEditDialog = useCallback(() => {
    setIsBulkDialogOpen(true);
  }, []);

  const closeBulkEditDialog = useCallback(() => {
    setIsBulkDialogOpen(false);
  }, []);

  const handleBulkEditStateChange = useCallback((state: ShiftState) => {
    setBulkEditState(state);
  }, []);

  const applyBulkEdit = useCallback(
    async (staffIds: string[], dayKeys: string[]) => {
      if (!staffIds.length || !dayKeys.length) return;
      setIsSavingBulkEdit(true);
      try {
        await applyShiftState(staffIds, dayKeys, bulkEditState);
        dispatch(setSnackbarSuccess(MESSAGE_CODE.S16001));
        closeBulkEditDialog();
      } catch (error) {
        console.error("Failed to apply bulk shift edit", error);
        dispatch(setSnackbarError(MESSAGE_CODE.E16001));
      } finally {
        setIsSavingBulkEdit(false);
      }
    },
    [applyShiftState, bulkEditState, closeBulkEditDialog, dispatch]
  );

  return {
    editingCell,
    editingState,
    isEditDialogOpen: Boolean(editingCell),
    isSavingSingleEdit,
    openShiftEditDialog,
    closeShiftEditDialog,
    handleEditingStateChange,
    saveShiftEdit,
    isBulkDialogOpen,
    openBulkEditDialog,
    closeBulkEditDialog,
    bulkEditState,
    handleBulkEditStateChange,
    isSavingBulkEdit,
    applyBulkEdit,
  } as const;
}
