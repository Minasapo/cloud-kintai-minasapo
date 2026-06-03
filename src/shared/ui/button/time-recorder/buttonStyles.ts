import { designTokenVar } from "@shared/designSystem";
import type { CSSProperties } from "react";

const ACTION_BUTTON_MIN_HEIGHT = designTokenVar(
  "component.timeRecorder.actionCard.minHeight",
  "140px",
);
const ACTION_BUTTON_RADIUS = designTokenVar(
  "component.timeRecorder.actionCard.borderRadius",
  "28px",
);
const ACTION_BUTTON_PADDING = designTokenVar(
  "component.timeRecorder.actionCard.padding",
  "20px",
);
const ACTION_BUTTON_BORDER_WIDTH = designTokenVar(
  "component.timeRecorder.actionCard.borderWidth",
  "1px",
);
const ACTION_BUTTON_DISABLED_BORDER = designTokenVar(
  "component.timeRecorder.actionCard.disabledBorderColor",
  "rgb(203 213 225)",
);
const ACTION_BUTTON_DISABLED_BACKGROUND = designTokenVar(
  "component.timeRecorder.actionCard.disabledBackground",
  "rgb(226 232 240)",
);
const ACTION_BUTTON_DISABLED_TEXT = designTokenVar(
  "component.timeRecorder.actionCard.disabledTextColor",
  "rgb(100 116 139)",
);
const ACTION_BUTTON_DISABLED_MUTED = designTokenVar(
  "component.timeRecorder.actionCard.disabledMutedColor",
  "rgb(148 163 184)",
);

const PRIMARY_BASE = designTokenVar(
  "color.brand.primary.base",
  "rgb(15 168 94)",
);
const PRIMARY_SURFACE = designTokenVar(
  "component.timeRecorder.actionCard.primarySurface",
  "rgb(236 253 243)",
);
const PRIMARY_DEEP = designTokenVar(
  "component.timeRecorder.actionCard.primaryDeep",
  "rgb(4 120 87)",
);
const DANGER_BASE = designTokenVar(
  "color.feedback.danger.base",
  "rgb(215 68 62)",
);
const DANGER_SURFACE = designTokenVar(
  "component.timeRecorder.actionCard.dangerSurface",
  "rgb(254 242 242)",
);
const DANGER_DEEP = designTokenVar(
  "component.timeRecorder.actionCard.dangerDeep",
  "rgb(185 28 28)",
);
const INFO_SURFACE = designTokenVar(
  "component.timeRecorder.actionCard.infoSurface",
  "rgb(239 246 255)",
);
const INDIGO_BASE = designTokenVar(
  "component.timeRecorder.actionCard.indigoBase",
  "rgb(220 38 38)",
);
const INDIGO_DEEP = designTokenVar(
  "component.timeRecorder.actionCard.indigoDeep",
  "rgb(185 28 28)",
);
const AMBER_BASE = designTokenVar(
  "component.timeRecorder.actionCard.amberBase",
  "rgb(37 99 235)",
);
const AMBER_DEEP = designTokenVar(
  "component.timeRecorder.actionCard.amberDeep",
  "rgb(29 78 216)",
);

type ActionButtonPalette = {
  background: string;
  border: string;
  text: string;
  mutedText: string;
  iconBackground: string;
  iconText: string;
  hoverBackground: string;
  hoverBorder: string;
  hoverText: string;
  glow: string;
};

export const TIME_RECORDER_BUTTON_PALETTES = {
  clockIn: {
    background: `linear-gradient(160deg, ${PRIMARY_SURFACE} 0%, rgb(255 255 255) 100%)`,
    border: PRIMARY_BASE,
    text: PRIMARY_DEEP,
    mutedText: PRIMARY_BASE,
    iconBackground: "rgba(15,168,94,0.08)",
    iconText: PRIMARY_BASE,
    hoverBackground: `linear-gradient(160deg, ${PRIMARY_SURFACE} 0%, rgb(247 255 251) 100%)`,
    hoverBorder: "rgb(16 185 129)",
    hoverText: PRIMARY_DEEP,
    glow: "rgba(16, 185, 129, 0.18)",
  },
  clockOut: {
    background: `linear-gradient(160deg, ${DANGER_SURFACE} 0%, rgb(255 255 255) 100%)`,
    border: DANGER_BASE,
    text: DANGER_DEEP,
    mutedText: DANGER_BASE,
    iconBackground: "rgba(215,68,62,0.08)",
    iconText: DANGER_BASE,
    hoverBackground: `linear-gradient(160deg, ${DANGER_SURFACE} 0%, rgb(255 247 247) 100%)`,
    hoverBorder: "rgb(248 113 113)",
    hoverText: DANGER_DEEP,
    glow: "rgba(239, 68, 68, 0.16)",
  },
  rest: {
    background: `linear-gradient(160deg, ${INFO_SURFACE} 0%, rgb(255 255 255) 100%)`,
    border: AMBER_BASE,
    text: AMBER_DEEP,
    mutedText: AMBER_BASE,
    iconBackground: "rgba(37,99,235,0.08)",
    iconText: AMBER_BASE,
    hoverBackground: `linear-gradient(160deg, ${INFO_SURFACE} 0%, rgb(248 251 255) 100%)`,
    hoverBorder: "rgb(96 165 250)",
    hoverText: AMBER_DEEP,
    glow: "rgba(37, 99, 235, 0.16)",
  },
  subtle: {
    background: `linear-gradient(160deg, ${PRIMARY_SURFACE} 0%, rgb(255 255 255) 100%)`,
    border: PRIMARY_BASE,
    text: PRIMARY_DEEP,
    mutedText: PRIMARY_BASE,
    iconBackground: "rgba(15,168,94,0.08)",
    iconText: PRIMARY_BASE,
    hoverBackground: `linear-gradient(160deg, ${PRIMARY_SURFACE} 0%, rgb(247 255 251) 100%)`,
    hoverBorder: "rgb(16 185 129)",
    hoverText: PRIMARY_DEEP,
    glow: "rgba(16, 185, 129, 0.18)",
  },
  subtleDanger: {
    background: `linear-gradient(160deg, ${DANGER_SURFACE} 0%, rgb(255 255 255) 100%)`,
    border: INDIGO_BASE,
    text: INDIGO_DEEP,
    mutedText: INDIGO_BASE,
    iconBackground: "rgba(220,38,38,0.08)",
    iconText: INDIGO_BASE,
    hoverBackground: `linear-gradient(160deg, ${DANGER_SURFACE} 0%, rgb(255 247 247) 100%)`,
    hoverBorder: "rgb(248 113 113)",
    hoverText: INDIGO_DEEP,
    glow: "rgba(239, 68, 68, 0.16)",
  },
} as const satisfies Record<string, ActionButtonPalette>;

export const buildActionCardVars = (
  palette: ActionButtonPalette,
): CSSProperties & Record<`--${string}`, string> => ({
  "--action-card-min-height": ACTION_BUTTON_MIN_HEIGHT,
  "--action-card-radius": ACTION_BUTTON_RADIUS,
  "--action-card-padding": ACTION_BUTTON_PADDING,
  "--action-card-border-width": ACTION_BUTTON_BORDER_WIDTH,
  "--action-card-disabled-border": ACTION_BUTTON_DISABLED_BORDER,
  "--action-card-disabled-bg": ACTION_BUTTON_DISABLED_BACKGROUND,
  "--action-card-disabled-text": ACTION_BUTTON_DISABLED_TEXT,
  "--action-card-disabled-muted": ACTION_BUTTON_DISABLED_MUTED,
  "--action-card-bg": palette.background,
  "--action-card-border": palette.border,
  "--action-card-text": palette.text,
  "--action-card-muted-text": palette.mutedText,
  "--action-card-icon-bg": palette.iconBackground,
  "--action-card-icon-text": palette.iconText,
  "--action-card-hover-bg": palette.hoverBackground,
  "--action-card-hover-border": palette.hoverBorder,
  "--action-card-hover-text": palette.hoverText,
  "--action-card-glow": palette.glow,
});
