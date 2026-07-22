import React from "react";

type UseShiftBulkEditActionsParams = {
  hasBulkSelection: boolean;
  openBulkEditDialog: () => void;
  applyBulkEdit: (staffIds: string[], dayKeys: string[]) => Promise<void>;
  selectedStaffIds: Set<string>;
  selectedDayKeys: Set<string>;
};

export function useShiftBulkEditActions({
  hasBulkSelection,
  openBulkEditDialog,
  applyBulkEdit,
  selectedStaffIds,
  selectedDayKeys,
}: UseShiftBulkEditActionsParams) {
  const handleOpenBulkEditDialog = React.useCallback(() => {
    if (!hasBulkSelection) return;
    openBulkEditDialog();
  }, [hasBulkSelection, openBulkEditDialog]);

  const handleApplyBulkEdit = React.useCallback(() => {
    if (!hasBulkSelection) return;
    const staffIds = Array.from(selectedStaffIds);
    const selectedDayKeyList = Array.from(selectedDayKeys);
    void applyBulkEdit(staffIds, selectedDayKeyList);
  }, [applyBulkEdit, hasBulkSelection, selectedDayKeys, selectedStaffIds]);

  return { handleOpenBulkEditDialog, handleApplyBulkEdit };
}
