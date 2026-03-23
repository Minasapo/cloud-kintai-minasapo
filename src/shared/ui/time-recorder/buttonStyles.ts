import type { CSSProperties } from "react";

import { designTokenVar } from "@/shared/designSystem";

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
  "#CBD5E1",
);
const ACTION_BUTTON_DISABLED_BACKGROUND = designTokenVar(
  "component.timeRecorder.actionCard.disabledBackground",
  "#E2E8F0",
);
const ACTION_BUTTON_DISABLED_TEXT = designTokenVar(
  "component.timeRecorder.actionCard.disabledTextColor",
  "#64748B",
);
const ACTION_BUTTON_DISABLED_MUTED = designTokenVar(
  "component.timeRecorder.actionCard.disabledMutedColor",
  "#94A3B8",
);

const PRIMARY_BASE = designTokenVar("color.brand.primary.base", "#0FA85E");
const PRIMARY_SURFACE = designTokenVar(
  "component.timeRecorder.actionCard.primarySurface",
  "#ECFDF3",
);
const PRIMARY_DEEP = designTokenVar(
  "component.timeRecorder.actionCard.primaryDeep",
  "#047857",
);
const DANGER_BASE = designTokenVar("color.feedback.danger.base", "#D7443E");
const DANGER_SURFACE = designTokenVar(
  "component.timeRecorder.actionCard.dangerSurface",
  "#FEF2F2",
);
const DANGER_DEEP = designTokenVar(
  "component.timeRecorder.actionCard.dangerDeep",
  "#B91C1C",
);
const INFO_SURFACE = designTokenVar(
  "component.timeRecorder.actionCard.infoSurface",
  "#EFF6FF",
);
const INDIGO_BASE = designTokenVar(
  "component.timeRecorder.actionCard.indigoBase",
  "#DC2626",
);
const INDIGO_DEEP = designTokenVar(
  "component.timeRecorder.actionCard.indigoDeep",
  "#B91C1C",
);
const AMBER_BASE = designTokenVar(
  "component.timeRecorder.actionCard.amberBase",
  "#2563EB",
);
const AMBER_DEEP = designTokenVar(
  "component.timeRecorder.actionCard.amberDeep",
  "#1D4ED8",
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

export const ACTION_CARD_CLASS_NAME =
  "group relative flex min-h-[112px] w-full appearance-none flex-col justify-between overflow-hidden rounded-[1.4rem] border px-4 py-4 text-left shadow-[0_18px_42px_-24px_var(--action-card-glow)] transition duration-200 ease-out disabled:cursor-not-allowed disabled:border-[var(--action-card-disabled-border)] disabled:bg-[var(--action-card-disabled-bg)] disabled:text-[color:var(--action-card-disabled-text)] disabled:shadow-none md:min-h-[var(--action-card-min-height)] md:rounded-[var(--action-card-radius)] md:border-[var(--action-card-border-width)] md:px-[var(--action-card-padding)] md:py-[var(--action-card-padding)]";

export const ACTION_CARD_TONE_CLASS_NAME =
  "border-[var(--action-card-border)] bg-[var(--action-card-bg)] text-[color:var(--action-card-text)] ring-1 ring-black/5 hover:-translate-y-0.5 hover:border-[var(--action-card-hover-border)] hover:bg-[var(--action-card-hover-bg)] hover:text-[color:var(--action-card-hover-text)]";

export const ACTION_CARD_LABEL_CLASS_NAME =
  "whitespace-pre-line text-[1rem] font-bold leading-[1.1] tracking-[-0.02em] md:text-[1.35rem]";

export const ACTION_CARD_HELPER_CLASS_NAME =
  "mt-1 text-[0.72rem] font-medium leading-4 text-[color:var(--action-card-muted-text)] transition-colors group-hover:text-[color:var(--action-card-hover-text)] disabled:text-[color:var(--action-card-disabled-muted)] md:mt-2 md:text-sm md:leading-5";

export const ACTION_CARD_ICON_WRAPPER_CLASS_NAME =
  "inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--action-card-icon-bg)] text-[color:var(--action-card-icon-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_20px_-14px_rgba(15,23,42,0.5)] md:h-11 md:w-11";

export const TIME_RECORDER_BUTTON_PALETTES = {
  clockIn: {
    background: `linear-gradient(160deg, ${PRIMARY_SURFACE} 0%, #ffffff 100%)`,
    border: PRIMARY_BASE,
    text: PRIMARY_DEEP,
    mutedText: PRIMARY_BASE,
    iconBackground: "rgba(15,168,94,0.08)",
    iconText: PRIMARY_BASE,
    hoverBackground: `linear-gradient(160deg, ${PRIMARY_SURFACE} 0%, #F7FFFB 100%)`,
    hoverBorder: "#10B981",
    hoverText: PRIMARY_DEEP,
    glow: "rgba(16, 185, 129, 0.18)",
  },
  clockOut: {
    background: `linear-gradient(160deg, ${DANGER_SURFACE} 0%, #ffffff 100%)`,
    border: DANGER_BASE,
    text: DANGER_DEEP,
    mutedText: DANGER_BASE,
    iconBackground: "rgba(215,68,62,0.08)",
    iconText: DANGER_BASE,
    hoverBackground: `linear-gradient(160deg, ${DANGER_SURFACE} 0%, #FFF7F7 100%)`,
    hoverBorder: "#F87171",
    hoverText: DANGER_DEEP,
    glow: "rgba(239, 68, 68, 0.16)",
  },
  rest: {
    background: `linear-gradient(160deg, ${INFO_SURFACE} 0%, #ffffff 100%)`,
    border: AMBER_BASE,
    text: AMBER_DEEP,
    mutedText: AMBER_BASE,
    iconBackground: "rgba(37,99,235,0.08)",
    iconText: AMBER_BASE,
    hoverBackground: `linear-gradient(160deg, ${INFO_SURFACE} 0%, #F8FBFF 100%)`,
    hoverBorder: "#60A5FA",
    hoverText: AMBER_DEEP,
    glow: "rgba(37, 99, 235, 0.16)",
  },
  subtle: {
    background: `linear-gradient(160deg, ${PRIMARY_SURFACE} 0%, #ffffff 100%)`,
    border: PRIMARY_BASE,
    text: PRIMARY_DEEP,
    mutedText: PRIMARY_BASE,
    iconBackground: "rgba(15,168,94,0.08)",
    iconText: PRIMARY_BASE,
    hoverBackground: `linear-gradient(160deg, ${PRIMARY_SURFACE} 0%, #F7FFFB 100%)`,
    hoverBorder: "#10B981",
    hoverText: PRIMARY_DEEP,
    glow: "rgba(16, 185, 129, 0.18)",
  },
  subtleDanger: {
    background: `linear-gradient(160deg, ${DANGER_SURFACE} 0%, #ffffff 100%)`,
    border: INDIGO_BASE,
    text: INDIGO_DEEP,
    mutedText: INDIGO_BASE,
    iconBackground: "rgba(220,38,38,0.08)",
    iconText: INDIGO_BASE,
    hoverBackground: `linear-gradient(160deg, ${DANGER_SURFACE} 0%, #FFF7F7 100%)`,
    hoverBorder: "#F87171",
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
