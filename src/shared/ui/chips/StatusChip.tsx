import Chip from "@mui/material/Chip";
import { designTokenVar } from "@shared/designSystem";

type FeedbackKey = "success" | "warning" | "danger" | "info";

type PaletteVars = {
  base: string;
  surface: string;
  border: string;
};

const createFeedbackPalette = (
  key: FeedbackKey,
  defaults: PaletteVars,
): PaletteVars => ({
  base: designTokenVar(`color.feedback.${key}.base`, defaults.base),
  surface: designTokenVar(`color.feedback.${key}.surface`, defaults.surface),
  border: designTokenVar(`color.feedback.${key}.border`, defaults.border),
});

const FEEDBACK_COLORS: Record<FeedbackKey, PaletteVars> = {
  success: createFeedbackPalette("success", {
    base: "rgb(30 170 106)",
    surface: "rgb(236 248 241)",
    border: "rgba(30, 170, 106, 0.4)",
  }),
  warning: createFeedbackPalette("warning", {
    base: "rgb(232 164 71)",
    surface: "rgb(255 247 234)",
    border: "rgba(232, 164, 71, 0.4)",
  }),
  danger: createFeedbackPalette("danger", {
    base: "rgb(215 68 62)",
    surface: "rgb(253 236 236)",
    border: "rgba(215, 68, 62, 0.4)",
  }),
  info: createFeedbackPalette("info", {
    base: "rgb(60 126 219)",
    surface: "rgb(237 242 252)",
    border: "rgba(60, 126, 219, 0.4)",
  }),
};

const FALLBACK_COLORS: PaletteVars = {
  base: designTokenVar(
    "component.workflowList.statusChip.fallback.base",
    "rgb(69 87 79)",
  ),
  surface: designTokenVar(
    "component.workflowList.statusChip.fallback.surface",
    "rgb(237 241 239)",
  ),
  border: designTokenVar(
    "component.workflowList.statusChip.fallback.border",
    "rgba(69, 87, 79, 0.4)",
  ),
};

const STATUS_CHIP_BORDER_RADIUS = designTokenVar(
  "component.workflowList.statusChip.borderRadius",
  "999px",
);
const STATUS_CHIP_FONT_SIZE = designTokenVar(
  "component.workflowList.statusChip.fontSize",
  "14px",
);
const STATUS_CHIP_GAP = designTokenVar(
  "component.workflowList.statusChip.gap",
  "4px",
);
const STATUS_CHIP_PADDING_X = designTokenVar(
  "component.workflowList.statusChip.paddingX",
  "8px",
);
const STATUS_CHIP_FONT_WEIGHT = designTokenVar(
  "component.workflowList.statusChip.fontWeight",
  "500",
);
const STATUS_CHIP_EASING = designTokenVar(
  "component.workflowList.statusChip.transitionEasing",
  "cubic-bezier(0.2, 0.8, 0.4, 1)",
);
const STATUS_CHIP_DURATION = designTokenVar(
  "component.workflowList.statusChip.transitionMs",
  "120ms",
);

type StatusChipProps<T extends string = string> = {
  status?: T | null;
  labelMap: Partial<Record<T, string>>;
  colorMap: Partial<Record<T, FeedbackKey>>;
  size?: "small" | "medium";
};

export default function StatusChip<T extends string = string>({
  status,
  labelMap,
  colorMap,
}: StatusChipProps<T>) {
  const label = status != null ? (labelMap[status] ?? status) : "-";
  const feedbackKey = status != null ? colorMap[status] : undefined;
  const palette =
    feedbackKey != null ? FEEDBACK_COLORS[feedbackKey] : FALLBACK_COLORS;

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        borderRadius: STATUS_CHIP_BORDER_RADIUS,
        fontSize: `clamp(12px, 3.2vw, ${STATUS_CHIP_FONT_SIZE})`,
        fontWeight: STATUS_CHIP_FONT_WEIGHT,
        lineHeight: 1.4,
        height: "auto",
        minHeight: "1.5rem",
        maxWidth: "100%",
        px: 0,
        py: 0,
        gap: STATUS_CHIP_GAP,
        flexShrink: 1,
        verticalAlign: "middle",
        transition: `background-color ${STATUS_CHIP_DURATION} ${STATUS_CHIP_EASING}, color ${STATUS_CHIP_DURATION} ${STATUS_CHIP_EASING}`,
        backgroundColor: palette.surface,
        color: palette.base,
        border: `1px solid ${palette.border}`,
        "& .MuiChip-label": {
          px: 0,
          paddingLeft: STATUS_CHIP_PADDING_X,
          paddingRight: STATUS_CHIP_PADDING_X,
          paddingTop: "2px",
          paddingBottom: "2px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        },
      }}
    />
  );
}
