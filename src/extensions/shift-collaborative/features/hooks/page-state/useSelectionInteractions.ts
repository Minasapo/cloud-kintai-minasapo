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
  showHelp,
  setShowHelp,
  updateUserActivity,
  focusCell,
  selectCell,
  clearSelection,
  clearFocus,
}: UseSelectionInteractionsParams) => {
  const handleSelectAll = useCallback(() => {
    return;
  }, []);

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

      if (event.shiftKey || event.ctrlKey || event.metaKey) {
        event.preventDefault();
      }

      selectCell(staffId, date);
      focusCell(staffId, date);
    },
    [isBatchUpdating, updateUserActivity, focusCell, selectCell],
  );

  const handleCellMouseDown = useCallback(
    (staffId: string, date: string, event: MouseEvent) => {
      if (isBatchUpdating) {
        return;
      }

      if (event.shiftKey || event.ctrlKey || event.metaKey) {
        return;
      }

      selectCell(staffId, date);
      focusCell(staffId, date);
    },
    [isBatchUpdating, selectCell, focusCell],
  );

  const handleCellMouseEnter = useCallback(
    (_staffId: string, _date: string) => {
      return;
    },
    [],
  );

  const handleMouseUp = useCallback(() => {
    return;
  }, []);

  return {
    handleSelectAll,
    handleEscape,
    handleCellClick,
    handleCellMouseDown,
    handleCellMouseEnter,
    handleMouseUp,
  };
};
