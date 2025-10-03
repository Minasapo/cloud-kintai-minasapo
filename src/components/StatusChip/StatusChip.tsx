import { Chip } from "@mui/material";
import React from "react";

import { WorkflowStatus } from "@/API";
import { STATUS_LABELS } from "@/lib/workflowLabels";

type Props = {
  status?: string | null;
};

export default function StatusChip({ status }: Props) {
  const label = status
    ? STATUS_LABELS[status as WorkflowStatus] || status
    : "-";

  // Map workflow status to Chip color/variant
  // Use a neutral/outlined style for CANCELLED so it's not bright red
  let color:
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" = "default";
  let variant: "filled" | "outlined" = "filled";

  if (
    status === WorkflowStatus.APPROVED ||
    status === "承認" ||
    status === "承認済" ||
    status === "承認済み"
  ) {
    color = "success";
  } else if (status === WorkflowStatus.PENDING || status === "未承認") {
    color = "warning";
  } else if (status === WorkflowStatus.REJECTED) {
    color = "error";
  } else if (status === WorkflowStatus.CANCELLED) {
    color = "default";
    variant = "outlined";
  } else if (status === WorkflowStatus.SUBMITTED) {
    color = "info";
  } else {
    color = "default";
  }

  return <Chip label={label} color={color} variant={variant} size="small" />;
}
