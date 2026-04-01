import type { OperationLog } from "@shared/api/graphql/types";

import { parseOperationLogJson } from "@/entities/operation-log/model/canonicalOperationLog";

import { getOperationLogLabel } from "./operationLogLabels";

type OperationLogDisplaySource = Pick<OperationLog, "action" | "details"> & {
  summary?: unknown;
};

type OperationLogResourceSource = {
  resource?: unknown;
  resourceId?: unknown;
  resourceKey?: unknown;
};

const toInlineJson = (value: unknown) => {
  if (value === null || typeof value !== "object") {
    return null;
  }

  try {
    const serialized = JSON.stringify(value);
    return serialized && serialized !== "{}" ? serialized : serialized ?? null;
  } catch {
    return null;
  }
};

export const formatOperationLogInlineValue = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return toInlineJson(value);
};

const getDetailsSummary = (details?: string | null): unknown => {
  const parsed = parseOperationLogJson(details);

  if (!parsed || typeof parsed !== "object" || !("summary" in parsed)) {
    return undefined;
  }

  return (parsed as { summary?: unknown }).summary;
};

export const getOperationLogResourceDisplay = (
  log: OperationLogResourceSource,
) => {
  const resourceKey = formatOperationLogInlineValue(log.resourceKey);
  if (resourceKey) {
    return resourceKey;
  }

  const resource = formatOperationLogInlineValue(log.resource);
  const resourceId = formatOperationLogInlineValue(log.resourceId);
  const fallback = [resource, resourceId].filter(Boolean).join(" ");

  return fallback || "(no resource)";
};

export const getOperationLogDisplaySummary = (
  log: OperationLogDisplaySource,
) => {
  const summary = formatOperationLogInlineValue(log.summary);
  if (summary) {
    return summary;
  }

  const detailsSummary = formatOperationLogInlineValue(
    getDetailsSummary(log.details),
  );
  if (detailsSummary) {
    return detailsSummary;
  }

  return getOperationLogLabel(log.action);
};
