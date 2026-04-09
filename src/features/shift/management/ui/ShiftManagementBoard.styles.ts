import { designTokenVar, getDesignTokens } from "@shared/designSystem";

const DEFAULT_THEME_TOKENS = getDesignTokens();
const shiftBoardTokens = DEFAULT_THEME_TOKENS.component.shiftBoard;
const SHIFT_BOARD_BASE_PATH = "component.shiftBoard";

const mixWithTransparent = (
  tokenPath: string,
  fallback: string,
  opacity: number,
) => {
  const percentage = Math.round(Math.min(Math.max(opacity, 0), 1) * 100);
  return `color-mix(in srgb, ${designTokenVar(
    tokenPath,
    fallback,
  )} ${percentage}%, transparent)`;
};

export const SHIFT_BOARD_PADDING_X = designTokenVar(
  `${SHIFT_BOARD_BASE_PATH}.columnGap`,
  `${shiftBoardTokens.columnGap}px`,
);
export const SHIFT_BOARD_PADDING_Y = designTokenVar(
  `${SHIFT_BOARD_BASE_PATH}.rowGap`,
  `${shiftBoardTokens.rowGap}px`,
);
export const SHIFT_BOARD_HALF_PADDING_X = `calc(${SHIFT_BOARD_PADDING_X} / 2)`;
export const SHIFT_BOARD_HALF_PADDING_Y = `calc(${SHIFT_BOARD_PADDING_Y} / 2)`;
export const SHIFT_BOARD_CELL_RADIUS = designTokenVar(
  `${SHIFT_BOARD_BASE_PATH}.cellRadius`,
  `${shiftBoardTokens.cellRadius}px`,
);
export const SHIFT_BOARD_TRANSITION = `${designTokenVar(
  "motion.duration.medium",
  `${DEFAULT_THEME_TOKENS.motion.duration.medium}ms`,
)} ${designTokenVar(
  "motion.easing.standard",
  DEFAULT_THEME_TOKENS.motion.easing.standard,
)}`;
export const SHIFT_BOARD_FOCUS_RING_COLOR = designTokenVar(
  "color.brand.primary.focusRing",
  DEFAULT_THEME_TOKENS.color.brand.primary.focusRing,
);
export const SHIFT_BOARD_FOCUS_SHADOW = designTokenVar(
  "shadow.card",
  DEFAULT_THEME_TOKENS.shadow.card,
);

export const SHIFT_BOARD_CELL_BASE_SX = {
  borderRadius: SHIFT_BOARD_CELL_RADIUS,
  transition: `background-color ${SHIFT_BOARD_TRANSITION}, box-shadow ${SHIFT_BOARD_TRANSITION}`,
};

export const SHIFT_BOARD_INTERACTIVE_FOCUS_SX = {
  "&:focus-visible": {
    outline: `2px solid ${SHIFT_BOARD_FOCUS_RING_COLOR}`,
    outlineOffset: 2,
    boxShadow: SHIFT_BOARD_FOCUS_SHADOW,
  },
};

export const HOLIDAY_BG = mixWithTransparent(
  "color.brand.accent.base",
  DEFAULT_THEME_TOKENS.color.brand.accent.base,
  0.22,
);
export const COMPANY_HOLIDAY_BG = mixWithTransparent(
  "color.brand.secondary.base",
  DEFAULT_THEME_TOKENS.color.brand.secondary.base,
  0.18,
);
export const SATURDAY_BG = mixWithTransparent(
  "color.brand.primary.base",
  DEFAULT_THEME_TOKENS.color.brand.primary.base,
  0.12,
);

// 固定幅の設定
export const STAFF_COL_WIDTH = 220;
export const AGG_COL_WIDTH = 132;
export const HISTORY_COL_WIDTH = 120;
export const DAY_COL_WIDTH = 48;

export const SUMMARY_LEFTS = {
  aggregate: STAFF_COL_WIDTH,
  changeHistory: STAFF_COL_WIDTH + AGG_COL_WIDTH,
} as const;
