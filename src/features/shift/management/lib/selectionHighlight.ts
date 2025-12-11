export const ROW_HIGHLIGHT_COLOR = "rgba(63, 81, 181, 0.12)";
export const COLUMN_HIGHLIGHT_COLOR = "rgba(255, 193, 7, 0.18)";
export const INTERSECTION_HIGHLIGHT_COLOR = "rgba(76, 175, 80, 0.2)";

export const getCellHighlightSx = (
  isRowSelected: boolean,
  isColumnSelected: boolean
) => {
  if (!isRowSelected && !isColumnSelected) return null;
  const color = isRowSelected
    ? isColumnSelected
      ? INTERSECTION_HIGHLIGHT_COLOR
      : ROW_HIGHLIGHT_COLOR
    : COLUMN_HIGHLIGHT_COLOR;
  return { boxShadow: `inset 0 0 0 9999px ${color}` };
};

export const getShiftKeyState = (nativeEvent: Event) => {
  if ("shiftKey" in nativeEvent) {
    return Boolean(
      (nativeEvent as MouseEvent | KeyboardEvent | PointerEvent).shiftKey
    );
  }
  return false;
};
