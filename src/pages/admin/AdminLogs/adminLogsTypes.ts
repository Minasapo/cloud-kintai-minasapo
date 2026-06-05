import {
  formatOperationLogInlineValue,
  getOperationLogDisplaySummary,
  getOperationLogResourceDisplay,
} from "@entities/operation-log/lib/operationLogDisplay";
import { getOperationLogLabel } from "@entities/operation-log/lib/operationLogLabels";
import { OperationLog, Staff } from "@shared/api/graphql/types";
import dayjs from "dayjs";

export type StaffOption = {
  label: string;
  value: string;
};

export type LogRow = {
  rowKey: string;
  log: OperationLog;
  timestampDisplay: string;
  actionLabel: string;
  actorDisplay: string;
  targetDisplay: string;
  resourceDisplay: string;
  summaryDisplay: string;
};

export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const resolveStaffDisplay = (
  id: unknown,
  staffMap: Record<string, Staff | null>,
) => {
  const idText = formatOperationLogInlineValue(id);
  if (!idText) {
    return "-";
  }
  if (!isNonEmptyString(id)) {
    return idText;
  }
  if (!(id in staffMap)) {
    return "読み込み中...";
  }
  const entry = staffMap[id];
  if (entry === null) {
    return idText;
  }
  const fullName =
    `${entry?.familyName ?? ""} ${entry?.givenName ?? ""}`.trim();
  return fullName || idText;
};

export const buildLogRow = (
  log: OperationLog,
  index: number,
  staffMap: Record<string, Staff | null>,
): LogRow => ({
  rowKey: `${log.id}-${log.timestamp ?? ""}-${index}`,
  log,
  timestampDisplay: log.timestamp
    ? dayjs(log.timestamp).format("YYYY-MM-DD HH:mm:ss")
    : "-",
  actionLabel: getOperationLogLabel(log.action),
  actorDisplay: resolveStaffDisplay(log.staffId as unknown, staffMap),
  targetDisplay: resolveStaffDisplay(log.targetStaffId as unknown, staffMap),
  resourceDisplay: getOperationLogResourceDisplay({
    resource: log.resource as unknown,
    resourceId: log.resourceId as unknown,
    resourceKey: log.resourceKey as unknown,
  }),
  summaryDisplay: getOperationLogDisplaySummary(log),
});
