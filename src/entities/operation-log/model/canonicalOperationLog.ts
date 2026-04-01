import type {
  CreateOperationLogInput,
  OperationLog,
} from "@shared/api/graphql/types";
import { getCurrentUser } from "aws-amplify/auth";

import { createLogger } from "@/shared/lib/logger";

import createOperationLogData from "./createOperationLogData";

const logger = createLogger("operationLog");

export const OPERATION_LOG_FORMAT_VERSION = 1;

export type CanonicalOperationLogPayload = {
  action: string;
  resource: string;
  resourceId?: string | null;
  resourceKey?: string | null;
  actorStaffId?: string | null;
  targetStaffId?: string | null;
  summary?: string | null;
  before?: unknown;
  after?: unknown;
  details?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  timestamp?: string | null;
  occurredAt?: string | null;
  resolvedWorkDate?: string | null;
  idempotencyKey?: string | null;
  appVersion?: string | null;
  clientTimezone?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
  severity?: string | null;
};

const LEGACY_ACTION_MAP: Record<string, string> = {
  clock_in: "attendance.clock_in",
  clock_out: "attendance.clock_out",
  go_directly: "attendance.go_directly",
  return_directly: "attendance.return_directly",
  rest_start: "attendance.rest_start",
  rest_end: "attendance.rest_end",
  start_break: "attendance.rest_start",
  end_break: "attendance.rest_end",
  submit_change_request: "attendance.request.submit",
  approve_change_request: "attendance.request.approve",
  reject_change_request: "attendance.request.reject",
  approve_workflow: "workflow.approve",
  reject_workflow: "workflow.reject",
  create_staff: "staff.create",
  update_staff: "staff.update",
  delete_staff: "staff.delete",
};

const ACTION_SUMMARIES: Record<string, string> = {
  "attendance.create": "勤怠を作成",
  "attendance.update": "勤怠を更新",
  "attendance.delete": "勤怠を削除",
  "attendance.clock_in": "出勤を記録",
  "attendance.clock_out": "退勤を記録",
  "attendance.go_directly": "直行を記録",
  "attendance.return_directly": "直帰を記録",
  "attendance.rest_start": "休憩開始を記録",
  "attendance.rest_end": "休憩終了を記録",
  "attendance.request.submit": "勤怠修正申請を送信",
  "attendance.request.approve": "勤怠修正申請を承認",
  "attendance.request.reject": "勤怠修正申請を却下",
  "attendance.workflow.apply": "ワークフロー承認で勤怠を反映",
  "workflow.approve": "ワークフローを承認",
  "workflow.reject": "ワークフローを却下",
  "staff.create": "スタッフを作成",
  "staff.update": "スタッフを更新",
  "staff.enable": "スタッフを有効化",
  "staff.disable": "スタッフを無効化",
  "staff.delete": "スタッフを削除",
  "app_config.create": "アプリ設定を作成",
  "app_config.update": "アプリ設定を更新",
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  !(value instanceof Date);

export const normalizeOperationLogAction = (action: string) =>
  LEGACY_ACTION_MAP[action] ?? action;

const resolveClientTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";

const resolveCanonicalAppVersion = () => {
  try {
    const env = Function(
      "return (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : undefined;",
    )() as
      | {
          VITE_APP_VERSION?: string;
          VITE_COMMIT_SHA?: string;
        }
      | undefined;

    return env?.VITE_APP_VERSION || env?.VITE_COMMIT_SHA || "unknown";
  } catch {
    return "unknown";
  }
};

export const buildOperationLogResourceKey = (
  resource: string,
  resourceId?: string | null,
) => (resourceId ? `${resource}#${resourceId}` : resource);

export const normalizeOperationLogValue = (value: unknown): unknown => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => {
      const normalized = normalizeOperationLogValue(item);
      return normalized === undefined ? null : normalized;
    });
  }

  if (isPlainObject(value)) {
    const sortedEntries = Object.entries(value)
      .filter(([key]) => key !== "__typename")
      .toSorted(([left], [right]) => left.localeCompare(right))
      .flatMap(([key, entryValue]) => {
        const normalized = normalizeOperationLogValue(entryValue);
        return normalized === undefined ? [] : [[key, normalized] as const];
      });

    return Object.fromEntries(sortedEntries);
  }

  return value;
};

export const parseOperationLogJson = (
  value?: string | null,
): unknown | null => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const serializeOperationLogJson = (value: unknown) => {
  const normalized = normalizeOperationLogValue(value);
  if (normalized === undefined) {
    return undefined;
  }
  return JSON.stringify(normalized);
};

const buildFullJsonDiff = (before: unknown, after: unknown) => {
  const normalizedBefore = normalizeOperationLogValue(before);
  const normalizedAfter = normalizeOperationLogValue(after);

  if (normalizedBefore === undefined && normalizedAfter === undefined) {
    return undefined;
  }

  return {
    mode: "full",
    before: normalizedBefore ?? null,
    after: normalizedAfter ?? null,
  };
};

const resolveActorStaffId = async (actorStaffId?: string | null) => {
  if (actorStaffId) {
    return actorStaffId;
  }

  try {
    const currentUser = await getCurrentUser();
    return currentUser.userId ?? currentUser.username ?? null;
  } catch {
    return null;
  }
};

const resolveOperationLogSummary = (action: string, fallback?: string | null) =>
  fallback?.trim() || ACTION_SUMMARIES[action] || action;

export const buildCanonicalOperationLogInput = async (
  payload: CanonicalOperationLogPayload,
): Promise<CreateOperationLogInput> => {
  const action = normalizeOperationLogAction(payload.action);
  const timestamp =
    payload.timestamp ?? payload.occurredAt ?? new Date().toISOString();
  const actorStaffId = await resolveActorStaffId(payload.actorStaffId);
  const resourceKey =
    payload.resourceKey ??
    buildOperationLogResourceKey(payload.resource, payload.resourceId);

  const details = payload.details
    ? {
        ...payload.details,
        summary: resolveOperationLogSummary(action, payload.summary),
      }
    : payload.summary
      ? { summary: payload.summary }
      : undefined;

  return {
    staffId: actorStaffId,
    resourceKey,
    targetStaffId: payload.targetStaffId ?? undefined,
    action,
    resource: payload.resource,
    resourceId: payload.resourceId ?? undefined,
    summary: resolveOperationLogSummary(action, payload.summary),
    timestamp,
    before: serializeOperationLogJson(payload.before),
    after: serializeOperationLogJson(payload.after),
    diff: serializeOperationLogJson(
      buildFullJsonDiff(payload.before, payload.after),
    ),
    details: serializeOperationLogJson(details),
    metadata: serializeOperationLogJson(payload.metadata),
    ipAddress: payload.ipAddress ?? undefined,
    userAgent:
      payload.userAgent ??
      (typeof navigator !== "undefined" ? navigator.userAgent : undefined),
    clientTimezone: payload.clientTimezone ?? resolveClientTimeZone(),
    occurredAt: payload.occurredAt ?? timestamp,
    resolvedWorkDate: payload.resolvedWorkDate ?? undefined,
    idempotencyKey: payload.idempotencyKey ?? undefined,
    appVersion: payload.appVersion ?? resolveCanonicalAppVersion(),
    severity: payload.severity ?? "INFO",
    logFormatVersion: OPERATION_LOG_FORMAT_VERSION,
  };
};

export const writeOperationLogEvent = async (
  payload: CanonicalOperationLogPayload,
): Promise<OperationLog> => {
  const input = await buildCanonicalOperationLogInput(payload);
  return createOperationLogData(input);
};

export const logOperationEvent = async (
  payload: CanonicalOperationLogPayload,
): Promise<void> => {
  try {
    await writeOperationLogEvent(payload);
  } catch (error) {
    logger.error("Operation log write failed", {
      action: payload.action,
      resource: payload.resource,
      resourceId: payload.resourceId,
      error,
    });
  }
};

export const isCanonicalOperationLog = (
  log: Pick<
    OperationLog,
    "logFormatVersion" | "resourceKey" | "before" | "after" | "diff"
  >,
) =>
  Boolean(
    log.logFormatVersion ||
    log.resourceKey ||
    log.before ||
    log.after ||
    log.diff,
  );

export const getOperationLogSnapshot = (
  log: Pick<OperationLog, "after" | "before">,
) => parseOperationLogJson(log.after) ?? parseOperationLogJson(log.before);
