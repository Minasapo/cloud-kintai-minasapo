import AdminShiftSettingsDialog from "@/features/admin-config-shift/AdminShiftSettingsDialog";

import type { ShiftState } from "../../lib/generateMockShifts";
import type { ShiftEditingTarget } from "../../model/useShiftManagementDialogs";
import ShiftBulkEditDialog from "./ShiftBulkEditDialog";
import ShiftEditDialog from "./ShiftEditDialog";

type Props = {
  isEditDialogOpen: boolean;
  editingCell: ShiftEditingTarget | null;
  editingState: ShiftState;
  isSavingSingleEdit: boolean;
  closeShiftEditDialog: () => void;
  handleEditingStateChange: (state: ShiftState) => void;
  saveShiftEdit: () => void;
  isBulkDialogOpen: boolean;
  selectedStaffCount: number;
  selectedDayCount: number;
  selectedCellCount: number;
  bulkEditState: ShiftState;
  isSavingBulkEdit: boolean;
  hasBulkSelection: boolean;
  closeBulkEditDialog: () => void;
  handleBulkEditStateChange: (state: ShiftState) => void;
  handleApplyBulkEdit: () => void;
  isSettingsOpen: boolean;
  onCloseSettings: () => void;
};

export function ShiftManagementDialogs({
  isEditDialogOpen,
  editingCell,
  editingState,
  isSavingSingleEdit,
  closeShiftEditDialog,
  handleEditingStateChange,
  saveShiftEdit,
  isBulkDialogOpen,
  selectedStaffCount,
  selectedDayCount,
  selectedCellCount,
  bulkEditState,
  isSavingBulkEdit,
  hasBulkSelection,
  closeBulkEditDialog,
  handleBulkEditStateChange,
  handleApplyBulkEdit,
  isSettingsOpen,
  onCloseSettings,
}: Props) {
  return (
    <>
      <ShiftEditDialog
        open={isEditDialogOpen}
        editingCell={editingCell}
        editingState={editingState}
        isSaving={isSavingSingleEdit}
        onClose={closeShiftEditDialog}
        onStateChange={handleEditingStateChange}
        onSubmit={saveShiftEdit}
      />

      <ShiftBulkEditDialog
        open={isBulkDialogOpen}
        selectedStaffCount={selectedStaffCount}
        selectedDayCount={selectedDayCount}
        selectedCellCount={selectedCellCount}
        bulkEditState={bulkEditState}
        isSaving={isSavingBulkEdit}
        canSubmit={hasBulkSelection}
        onClose={closeBulkEditDialog}
        onStateChange={handleBulkEditStateChange}
        onSubmit={handleApplyBulkEdit}
      />

      <AdminShiftSettingsDialog
        open={isSettingsOpen}
        onClose={onCloseSettings}
      />
    </>
  );
}
