import { WorkflowStatus } from "@shared/api/graphql/types";

import { STATUS_LABELS } from "@/entities/workflow/lib/workflowLabels";
import type { WorkflowListItem } from "@/features/workflow/list/workflowListModel";

export type WorkflowStatusSummary = {
  total: number;
  draft: number;
  pending: number;
  approved: number;
};

export function resolveWorkflowStatusKey(item: WorkflowListItem) {
  return item.rawStatus || item.status || "UNKNOWN";
}

export function isCancelledWorkflow(item: WorkflowListItem) {
  const statusKey = resolveWorkflowStatusKey(item);
  return (
    statusKey === WorkflowStatus.CANCELLED ||
    statusKey === STATUS_LABELS[WorkflowStatus.CANCELLED]
  );
}

export function countItemsByStatus(items: WorkflowListItem[]) {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const key = resolveWorkflowStatusKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return counts;
}

export function getStatusCount(counts: Map<string, number>, status: WorkflowStatus) {
  return counts.get(status) ?? counts.get(STATUS_LABELS[status]) ?? 0;
}

export function buildStatusSummary(items: WorkflowListItem[]): WorkflowStatusSummary {
  const counts = countItemsByStatus(items);
  return {
    total: items.length,
    draft: getStatusCount(counts, WorkflowStatus.DRAFT),
    pending: getStatusCount(counts, WorkflowStatus.SUBMITTED),
    approved: getStatusCount(counts, WorkflowStatus.APPROVED),
  };
}

export function resolveWorkflowKey(item: WorkflowListItem) {
  return item.rawId ? item.rawId : `${item.name}-${item.createdAt}`;
}

export function buildWorkflowDetailPath(item: WorkflowListItem) {
  return `/workflow/${encodeURIComponent(resolveWorkflowKey(item))}`;
}
