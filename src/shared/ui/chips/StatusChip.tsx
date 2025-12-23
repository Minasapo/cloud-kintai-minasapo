import { Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { WorkflowStatus } from "@shared/api/graphql/types";

import { DESIGN_TOKENS, designTokenVar } from "@/shared/designSystem";
import { REVERSE_STATUS, STATUS_LABELS } from "@/lib/workflowLabels";

const STATUS_FEEDBACK_MAP: Record<
  WorkflowStatus,
  keyof typeof DESIGN_TOKENS.color.feedback
> = {
  [WorkflowStatus.DRAFT]: "info",
  [WorkflowStatus.SUBMITTED]: "info",
  [WorkflowStatus.PENDING]: "warning",
  [WorkflowStatus.APPROVED]: "success",
  [WorkflowStatus.REJECTED]: "danger",
  [WorkflowStatus.CANCELLED]: "danger",
};

const FALLBACK_COLORS = {
  base: DESIGN_TOKENS.color.neutral[700],
  surface: DESIGN_TOKENS.color.neutral[100],
};

const statusChipTokens = DESIGN_TOKENS.component.workflowList.statusChip;
const STATUS_CHIP_BORDER_RADIUS = designTokenVar(
  "component.workflowList.statusChip.borderRadius",
  `${statusChipTokens.borderRadius}px`
);
const STATUS_CHIP_FONT_SIZE = designTokenVar(
  "component.workflowList.statusChip.fontSize",
  `${statusChipTokens.fontSize}px`
);
const STATUS_CHIP_GAP = designTokenVar(
  "component.workflowList.statusChip.gap",
  `${statusChipTokens.gap}px`
);
const STATUS_CHIP_PADDING_X = designTokenVar(
  "spacing.sm",
  `${DESIGN_TOKENS.spacing.sm}px`
);
const STATUS_CHIP_FONT_WEIGHT = designTokenVar(
  "typography.fontWeight.medium",
  `${DESIGN_TOKENS.typography.fontWeight.medium}`
);
const STATUS_CHIP_EASING = designTokenVar(
  "motion.easing.standard",
  DESIGN_TOKENS.motion.easing.standard
);
const STATUS_CHIP_DURATION = designTokenVar(
  "component.workflowList.statusChip.transitionMs",
  `${statusChipTokens.transitionMs}ms`
);

const isWorkflowStatus = (value: string): value is WorkflowStatus =>
  Boolean(STATUS_LABELS[value as WorkflowStatus]);

interface StatusChipProps {
  status?: string | null;
}

export default function StatusChip({ status }: StatusChipProps) {
  const resolvedStatus = (() => {
    if (!status) return undefined;
    if (typeof status === "string" && isWorkflowStatus(status)) {
      return status;
    }
    const reverseKey = REVERSE_STATUS[status];
    if (reverseKey && isWorkflowStatus(reverseKey)) {
      return reverseKey;
    }
    return undefined;
  })();

  const label = resolvedStatus
    ? STATUS_LABELS[resolvedStatus]
    : status
    ? status
    : "-";

  const feedbackPalette = resolvedStatus
    ? DESIGN_TOKENS.color.feedback[STATUS_FEEDBACK_MAP[resolvedStatus]]
    : undefined;
  const palette = feedbackPalette ?? FALLBACK_COLORS;

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        borderRadius: STATUS_CHIP_BORDER_RADIUS,
        fontSize: STATUS_CHIP_FONT_SIZE,
        fontWeight: STATUS_CHIP_FONT_WEIGHT,
        gap: STATUS_CHIP_GAP,
        px: STATUS_CHIP_PADDING_X,
        transition: `background-color ${STATUS_CHIP_DURATION} ${STATUS_CHIP_EASING}, color ${STATUS_CHIP_DURATION} ${STATUS_CHIP_EASING}`,
        backgroundColor: palette.surface,
        color: palette.base,
        border: `1px solid ${alpha(palette.base, 0.4)}`,
      }}
    />
  );
}
