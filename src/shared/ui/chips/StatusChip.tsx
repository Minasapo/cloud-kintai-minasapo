import { Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { WorkflowStatus } from "@shared/api/graphql/types";

import { DESIGN_TOKENS } from "@/shared/designSystem";
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

  const chipTokens = DESIGN_TOKENS.component.workflowList.statusChip;
  const easing = DESIGN_TOKENS.motion.easing.standard;
  const feedbackPalette = resolvedStatus
    ? DESIGN_TOKENS.color.feedback[STATUS_FEEDBACK_MAP[resolvedStatus]]
    : undefined;
  const palette = feedbackPalette ?? FALLBACK_COLORS;

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        borderRadius: chipTokens.borderRadius,
        fontSize: chipTokens.fontSize,
        fontWeight: DESIGN_TOKENS.typography.fontWeight.medium,
        gap: chipTokens.gap,
        px: DESIGN_TOKENS.spacing.sm,
        transition: `background-color ${chipTokens.transitionMs}ms ${easing}, color ${chipTokens.transitionMs}ms ${easing}`,
        backgroundColor: palette.surface,
        color: palette.base,
        border: `1px solid ${alpha(palette.base, 0.4)}`,
      }}
    />
  );
}
