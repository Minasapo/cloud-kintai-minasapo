import { alpha } from "@mui/material/styles";

import { DESIGN_TOKENS } from "@/shared/designSystem";

const shiftBoardTokens = DESIGN_TOKENS.component.shiftBoard;
const HIGHLIGHT_BACKGROUND = shiftBoardTokens.highlightBackground;
const HIGHLIGHT_BORDER = shiftBoardTokens.highlightBorder;
const HIGHLIGHT_DROP_SHADOW = shiftBoardTokens.dropShadow;
const HIGHLIGHT_RADIUS = shiftBoardTokens.cellRadius;
const HIGHLIGHT_TRANSITION = `${DESIGN_TOKENS.motion.duration.medium}ms ${DESIGN_TOKENS.motion.easing.standard}`;

const getBackgroundOpacity = (
  isRowSelected: boolean,
  isColumnSelected: boolean
) => {
  if (isRowSelected && isColumnSelected) return 0.9;
  if (isRowSelected) return 0.65;
  return 0.45;
};

const getBorderOpacity = (isRowSelected: boolean, isColumnSelected: boolean) =>
  isRowSelected && isColumnSelected ? 0.95 : 0.7;

export const getCellHighlightSx = (
  isRowSelected: boolean,
  isColumnSelected: boolean
) => {
  if (!isRowSelected && !isColumnSelected) return null;
  const borderWidth = isRowSelected && isColumnSelected ? 2 : 1;
  const borderOpacity = getBorderOpacity(isRowSelected, isColumnSelected);
  const highlightOverlay = `inset 0 0 0 ${borderWidth}px ${alpha(
    HIGHLIGHT_BORDER,
    borderOpacity
  )}`;
  const boxShadow =
    isRowSelected && isColumnSelected
      ? `${HIGHLIGHT_DROP_SHADOW}, ${highlightOverlay}`
      : highlightOverlay;

  return {
    borderRadius: `${HIGHLIGHT_RADIUS}px`,
    backgroundColor: alpha(
      HIGHLIGHT_BACKGROUND,
      getBackgroundOpacity(isRowSelected, isColumnSelected)
    ),
    boxShadow,
    transition: `background-color ${HIGHLIGHT_TRANSITION}, box-shadow ${HIGHLIGHT_TRANSITION}`,
  };
};

export const getShiftKeyState = (nativeEvent: Event) => {
  if ("shiftKey" in nativeEvent) {
    return Boolean(
      (nativeEvent as MouseEvent | KeyboardEvent | PointerEvent).shiftKey
    );
  }
  return false;
};
