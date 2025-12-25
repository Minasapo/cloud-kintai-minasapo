import { designTokenVar, getDesignTokens } from "@/shared/designSystem";

const DEFAULT_THEME_TOKENS = getDesignTokens();
const shiftBoardTokens = DEFAULT_THEME_TOKENS.component.shiftBoard;
const SHIFT_BOARD_BASE_PATH = "component.shiftBoard";
const HIGHLIGHT_BACKGROUND = designTokenVar(
  `${SHIFT_BOARD_BASE_PATH}.highlightBackground`,
  shiftBoardTokens.highlightBackground
);
const HIGHLIGHT_BORDER = designTokenVar(
  `${SHIFT_BOARD_BASE_PATH}.highlightBorder`,
  shiftBoardTokens.highlightBorder
);
const HIGHLIGHT_DROP_SHADOW = designTokenVar(
  `${SHIFT_BOARD_BASE_PATH}.dropShadow`,
  shiftBoardTokens.dropShadow
);
const HIGHLIGHT_RADIUS = designTokenVar(
  `${SHIFT_BOARD_BASE_PATH}.cellRadius`,
  `${shiftBoardTokens.cellRadius}px`
);
const HIGHLIGHT_TRANSITION = `${designTokenVar(
  "motion.duration.medium",
  `${DEFAULT_THEME_TOKENS.motion.duration.medium}ms`
)} ${designTokenVar(
  "motion.easing.standard",
  DEFAULT_THEME_TOKENS.motion.easing.standard
)}`;

const mixWithTransparent = (colorValue: string, opacity: number) => {
  const percentage = Math.round(Math.min(Math.max(opacity, 0), 1) * 100);
  return `color-mix(in srgb, ${colorValue} ${percentage}%, transparent)`;
};

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
  const highlightOverlay = `inset 0 0 0 ${borderWidth}px ${mixWithTransparent(
    HIGHLIGHT_BORDER,
    borderOpacity
  )}`;
  const boxShadow =
    isRowSelected && isColumnSelected
      ? `${HIGHLIGHT_DROP_SHADOW}, ${highlightOverlay}`
      : highlightOverlay;

  return {
    borderRadius: HIGHLIGHT_RADIUS,
    backgroundColor: mixWithTransparent(
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
