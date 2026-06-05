import { type MouseEvent, useCallback } from "react";

type UseSelectionInteractionsParams = {
  isBatchUpdating: boolean;
  isDragging: boolean;
  showHelp: boolean;
  setShowHelp: (next: boolean) => void;
  updateUserActivity: () => void;
  selectRange: (staffId: string, date: string) => void;
  toggleCell: (staffId: string, date: string) => void;
  focusCell: (staffId: string, date: string) => void;
  selectCell: (staffId: string, date: string) => void;
  startDragSelect: (staffId: string, date: string) => void;
  updateDragSelect: (staffId: string, date: string) => void;
  endDragSelect: () => void;
  clearSelection: () => void;
  clearFocus: () => void;
  selectAll: () => void;
};

export const useSelectionInteractions = ({
  isBatchUpdating,
  isDragging,
  showHelp,
  setShowHelp,
  updateUserActivity,
  selectRange,
  toggleCell,
  focusCell,
  selectCell,
  startDragSelect,
  updateDragSelect,
  endDragSelect,
  clearSelection,
  clearFocus,
  selectAll,
}: UseSelectionInteractionsParams) => {
  const handleSelectAll = useCallback(() => {
    selectAll();
  }, [selectAll]);

  const handleEscape = useCallback(() => {
    if (showHelp) {
      setShowHelp(false);
      return;
    }
    clearSelection();
    clearFocus();
  }, [showHelp, setShowHelp, clearSelection, clearFocus]);

  const handleCellClick = useCallback(
    (staffId: string, date: string, event: MouseEvent) => {
      if (isBatchUpdating) {
        return;
      }

      updateUserActivity();

      if (event.shiftKey) {
        selectRange(staffId, date);
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        toggleCell(staffId, date);
        focusCell(staffId, date);
        return;
      }

      selectCell(staffId, date);
      focusCell(staffId, date);
    },
    [
      isBatchUpdating,
      updateUserActivity,
      selectRange,
      toggleCell,
      focusCell,
      selectCell,
    ],
  );

  const handleCellMouseDown = useCallback(
    (staffId: string, date: string, event: MouseEvent) => {
      if (isBatchUpdating) {
        return;
      }

      if (event.shiftKey || event.ctrlKey || event.metaKey) {
        return;
      }

      startDragSelect(staffId, date);
    },
    [isBatchUpdating, startDragSelect],
  );

  const handleCellMouseEnter = useCallback(
    (staffId: string, date: string) => {
      if (isDragging) {
        updateDragSelect(staffId, date);
      }
    },
    [isDragging, updateDragSelect],
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      endDragSelect();
    }
  }, [isDragging, endDragSelect]);

  return {
    handleSelectAll,
    handleEscape,
    handleCellClick,
    handleCellMouseDown,
    handleCellMouseEnter,
    handleMouseUp,
  };
};
