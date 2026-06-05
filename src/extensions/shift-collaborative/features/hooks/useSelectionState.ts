import { useMultiSelect } from "./useMultiSelect";
import { useShiftNavigation } from "./useShiftNavigation";

export const useSelectionState = (staffIds: string[], dateKeys: string[]) => {
  const { focusedCell, registerCell, focusCell, navigate, clearFocus } =
    useShiftNavigation({
      staffIds,
      dates: dateKeys,
    });

  const {
    selectedCells,
    selectionCount,
    isCellSelected,
    selectCell,
    toggleCell,
    selectRange,
    startDragSelect,
    updateDragSelect,
    endDragSelect,
    selectAll,
    clearSelection,
    isDragging,
  } = useMultiSelect({
    staffIds,
    dates: dateKeys,
  });

  return {
    focusedCell,
    registerCell,
    focusCell,
    navigate,
    clearFocus,
    selectedCells,
    selectionCount,
    isCellSelected,
    selectCell,
    toggleCell,
    selectRange,
    startDragSelect,
    updateDragSelect,
    endDragSelect,
    selectAll,
    clearSelection,
    isDragging,
  };
};
