import type { CSSProperties } from "react";

import { designTokenVar } from "@/shared/designSystem";

const ACTION_BUTTON_SIZE = designTokenVar(
  "component.timeRecorder.actionButton.size",
  "120px",
);
const ACTION_BUTTON_SIZE_SM = designTokenVar(
  "component.timeRecorder.actionButton.sizeSm",
  "96px",
);
const ACTION_BUTTON_RADIUS = designTokenVar(
  "component.timeRecorder.actionButton.borderRadius",
  "999px",
);
const ACTION_BORDER_WIDTH = designTokenVar(
  "component.timeRecorder.actionButton.borderWidth",
  "3px",
);
const ACTION_DISABLED_BORDER = designTokenVar(
  "component.timeRecorder.actionButton.disabledBorderColor",
  "#C3CFC7",
);
const ACTION_DISABLED_BACKGROUND = designTokenVar(
  "component.timeRecorder.actionButton.disabledBackground",
  "#D9E2DD",
);
const ACTION_DISABLED_TEXT = designTokenVar(
  "component.timeRecorder.actionButton.disabledTextColor",
  "#6C7B74",
);

const REST_BUTTON_MAX_WIDTH = designTokenVar(
  "component.timeRecorder.restButton.maxWidth",
  "220px",
);
const REST_DISABLED_BACKGROUND = designTokenVar(
  "component.timeRecorder.restButton.disabledBackground",
  "#D9E2DD",
);

const PRIMARY_BASE = designTokenVar("color.brand.primary.base", "#0FA85E");
const PRIMARY_SURFACE = designTokenVar("color.brand.primary.surface", "#EAF7F0");
const PRIMARY_CONTRAST = designTokenVar(
  "color.brand.primary.contrastText",
  "#FFFFFF",
);
const DANGER_BASE = designTokenVar("color.feedback.danger.base", "#D7443E");

type ActionButtonPalette = {
  background: string;
  text: string;
  hoverBackground: string;
  hoverText: string;
  border: string;
  hoverBorder?: string;
};

export const ACTION_BUTTON_CLASS_NAME =
  "appearance-none border-solid shadow-none inline-flex h-[var(--action-button-size-sm)] w-[var(--action-button-size-sm)] min-w-[var(--action-button-size-sm)] items-center justify-center rounded-[var(--action-button-radius)] border-[var(--action-border-width)] px-0 text-center text-[0.95rem] font-medium leading-[1.2] transition-[color,background-color,border-color] duration-150 ease-in-out sm:h-[var(--action-button-size)] sm:w-[var(--action-button-size)] sm:min-w-[var(--action-button-size)] sm:text-base disabled:cursor-not-allowed disabled:border-[var(--action-disabled-border)] disabled:bg-[var(--action-disabled-bg)] disabled:text-[color:var(--action-disabled-text)]";

export const REST_BUTTON_CLASS_NAME =
  "appearance-none border-solid shadow-none inline-flex w-full max-w-[var(--rest-button-max-width)] items-center justify-center rounded-md border border-transparent px-4 py-2 font-medium transition-[color,background-color,border-color] duration-150 ease-in-out disabled:cursor-not-allowed disabled:border-transparent disabled:bg-[var(--rest-button-disabled-bg)] disabled:text-[color:var(--rest-button-color)]";

export const ACTION_BUTTON_LABEL_CLASS_NAME =
  "whitespace-pre-line leading-[1.2] sm:whitespace-nowrap";

export const TIME_RECORDER_BUTTON_PALETTES = {
  clockIn: {
    background: PRIMARY_BASE,
    text: PRIMARY_CONTRAST,
    hoverBackground: PRIMARY_CONTRAST,
    hoverText: PRIMARY_BASE,
    border: PRIMARY_BASE,
  },
  clockOut: {
    background: DANGER_BASE,
    text: PRIMARY_CONTRAST,
    hoverBackground: PRIMARY_CONTRAST,
    hoverText: DANGER_BASE,
    border: DANGER_BASE,
  },
  rest: {
    background: "transparent",
    text: PRIMARY_BASE,
    hoverBackground: PRIMARY_BASE,
    hoverText: PRIMARY_CONTRAST,
    border: "transparent",
  },
} as const satisfies Record<string, ActionButtonPalette>;

export const buildActionButtonVars = (
  palette: ActionButtonPalette,
): CSSProperties & Record<`--${string}`, string> => ({
  "--action-button-size": ACTION_BUTTON_SIZE,
  "--action-button-size-sm": ACTION_BUTTON_SIZE_SM,
  "--action-button-radius": ACTION_BUTTON_RADIUS,
  "--action-border-width": ACTION_BORDER_WIDTH,
  "--action-disabled-border": ACTION_DISABLED_BORDER,
  "--action-disabled-bg": ACTION_DISABLED_BACKGROUND,
  "--action-disabled-text": ACTION_DISABLED_TEXT,
  "--action-bg": palette.background,
  "--action-text": palette.text,
  "--action-hover-bg": palette.hoverBackground,
  "--action-hover-text": palette.hoverText,
  "--action-border": palette.border,
  "--action-hover-border": palette.hoverBorder ?? palette.border,
});

export const buildRestButtonVars =
  (): CSSProperties & Record<`--${string}`, string> => ({
    "--rest-button-max-width": REST_BUTTON_MAX_WIDTH,
    "--rest-button-disabled-bg": REST_DISABLED_BACKGROUND,
    "--rest-button-color": PRIMARY_BASE,
    "--rest-button-hover-bg": PRIMARY_BASE,
    "--rest-button-hover-text": PRIMARY_CONTRAST,
    "--rest-button-hover-border": PRIMARY_BASE,
    "--rest-button-surface": PRIMARY_SURFACE,
  });
