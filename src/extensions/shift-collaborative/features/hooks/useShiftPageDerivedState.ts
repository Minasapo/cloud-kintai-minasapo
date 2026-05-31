import { usePageLeaveGuard } from "@shared/ui/feedback/usePageLeaveGuard";
import { useCallback, useEffect, useMemo } from "react";

import { usePresenceNotifications } from "../components/PresenceNotification";
import {
  addCommentsToSelectedCells,
  buildCellEditLockHolders,
  buildSyncStatusConfig,
} from "../lib/shiftPageHelpers";
import { useCollaborativePageState } from "./useCollaborativePageState";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import { usePrintShift } from "./usePrintShift";

export const useShiftPageDerivedState = (
  pageState: ReturnType<typeof useCollaborativePageState>,
  cognitoUser: { id?: string } | null | undefined,
  staffs: Array<{ id: string; cognitoUserId?: string | null }>,
  staffNameMap: Map<string, string>,
  setShowHelp: (open: boolean) => void,
) => {
  const {
    state,
    selectionCount,
    selectedCells,
    focusedCell,
    getCellEditor,
    getCellHistory,
    violations,
    addComment,
    isCellSelected,
    navigate,
    handleChangeState,
    handleSelectAll,
    handleEscape,
  } = pageState;

  const currentUserId = useMemo(() => {
    if (!cognitoUser?.id) return "";
    const currentStaff = staffs.find(
      (staff) => staff.cognitoUserId === cognitoUser.id,
    );
    return currentStaff?.id ?? "";
  }, [cognitoUser, staffs]);

  const { addNotification } = usePresenceNotifications();
  const { isPrintDialogOpen, openPrintDialog, closePrintDialog } =
    usePrintShift();

  useEffect(() => {
    if (!state.lastRemoteUpdate) return;
    const staffName =
      staffNameMap.get(state.lastRemoteUpdate.staffId) ??
      state.lastRemoteUpdate.staffId;
    addNotification("data-synced", "", { staffName, date: "" });
  }, [state.lastRemoteUpdate, staffNameMap, addNotification]);

  const cellEditLockHolders = useMemo(
    () =>
      buildCellEditLockHolders(
        selectionCount,
        selectedCells,
        focusedCell,
        getCellEditor,
        currentUserId,
      ),
    [selectionCount, selectedCells, focusedCell, getCellEditor, currentUserId],
  );

  const cellHistory = useMemo(() => {
    if (selectionCount === 1 && selectedCells.length === 1) {
      return getCellHistory(
        `${selectedCells[0].staffId}#${selectedCells[0].date}`,
      );
    }
    if (focusedCell) {
      return getCellHistory(`${focusedCell.staffId}#${focusedCell.date}`);
    }
    return [];
  }, [selectionCount, selectedCells, focusedCell, getCellHistory]);

  const suggestionsBadgeCount = useMemo(
    () =>
      violations.filter(
        (v) => v.severity === "error" || v.severity === "warning",
      ).length,
    [violations],
  );

  const { syncButtonColor, syncTooltipTitle } = buildSyncStatusConfig(
    state.dataStatus,
    state.lastAutoSyncedAt,
    state.isSyncing,
  );

  const handleAddCommentsToSelectedCells = useCallback(
    async (content: string) => {
      await addCommentsToSelectedCells({
        content,
        selectionCount,
        shiftDataMap: state.shiftDataMap,
        isCellSelected,
        addComment,
      });
    },
    [state.shiftDataMap, isCellSelected, addComment, selectionCount],
  );

  useKeyboardShortcuts({
    enabled: true,
    onNavigate: navigate,
    onChangeState: handleChangeState,
    onSelectAll: handleSelectAll,
    onShowHelp: () => setShowHelp(true),
    onEscape: handleEscape,
  });

  const { dialog } = usePageLeaveGuard({
    isDirty: state.pendingChanges.size > 0,
    isBusy: state.dataStatus === "saving" || state.dataStatus === "syncing",
  });

  return {
    currentUserId,
    isPrintDialogOpen,
    openPrintDialog,
    closePrintDialog,
    cellEditLockHolders,
    cellHistory,
    suggestionsBadgeCount,
    syncButtonColor,
    syncTooltipTitle,
    handleAddCommentsToSelectedCells,
    dialog,
  };
};
