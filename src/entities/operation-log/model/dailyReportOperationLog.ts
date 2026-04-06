import type {
  DailyReport,
  DailyReportComment,
  DailyReportReactionType,
  DailyReportStatus,
} from "@shared/api/graphql/types";

import { logOperationEvent } from "./canonicalOperationLog";

type DailyReportSnapshotSource = {
  id: string;
  staffId: string;
  title?: string | null;
  content?: string | null;
  status?: DailyReportStatus | null;
  reportDate?: string | null;
  date?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  version?: number | null;
  reactions?: unknown;
  comments?: unknown;
};

type DailyReportMutationAction = "create" | "update" | "submit";
type DailyReportReactionOperation = "add" | "remove";

type DailyReportBaseLogParams = {
  actorStaffId: string;
  before?: DailyReportSnapshotSource | null;
  after: DailyReportSnapshotSource;
};

type DailyReportMutationLogParams = DailyReportBaseLogParams & {
  action: DailyReportMutationAction;
};

type DailyReportCommentLogParams = DailyReportBaseLogParams & {
  comment: Pick<DailyReportComment, "id" | "authorName" | "body" | "createdAt">;
};

type DailyReportReactionLogParams = DailyReportBaseLogParams & {
  operation: DailyReportReactionOperation;
  reactionType: DailyReportReactionType;
};

const DAILY_REPORT_ACTIONS: Record<DailyReportMutationAction, string> = {
  create: "daily_report.create",
  update: "daily_report.update",
  submit: "daily_report.submit",
};

const DAILY_REPORT_SUMMARIES: Record<DailyReportMutationAction, string> = {
  create: "日報を作成",
  update: "日報を更新",
  submit: "日報を提出",
};

const buildTitleLabel = (title?: string | null) => title?.trim() || "(無題)";

const buildBodyPreview = (body: string) =>
  body.trim().replace(/\s+/g, " ").slice(0, 120);

export const buildDailyReportLogSnapshot = (
  source: DailyReportSnapshotSource,
) => ({
  id: source.id,
  staffId: source.staffId,
  reportDate: source.reportDate ?? source.date ?? null,
  title: source.title ?? null,
  content: source.content ?? null,
  status: source.status ?? null,
  reactions: source.reactions ?? [],
  comments: source.comments ?? [],
  createdAt: source.createdAt ?? null,
  updatedAt: source.updatedAt ?? null,
  version: source.version ?? null,
});

const buildDailyReportSummary = (
  action: DailyReportMutationAction,
  snapshot: ReturnType<typeof buildDailyReportLogSnapshot>,
) => {
  const reportDate = snapshot.reportDate ?? "-";
  return `${reportDate} の ${DAILY_REPORT_SUMMARIES[action]}: ${buildTitleLabel(snapshot.title)}`;
};

export const logDailyReportMutation = async ({
  actorStaffId,
  before,
  after,
  action,
}: DailyReportMutationLogParams) => {
  const beforeSnapshot = before ? buildDailyReportLogSnapshot(before) : null;
  const afterSnapshot = buildDailyReportLogSnapshot(after);

  await logOperationEvent({
    action: DAILY_REPORT_ACTIONS[action],
    resource: "daily_report",
    resourceId: afterSnapshot.id,
    actorStaffId,
    targetStaffId: afterSnapshot.staffId,
    summary: buildDailyReportSummary(action, afterSnapshot),
    before: beforeSnapshot,
    after: afterSnapshot,
    details: {
      reportDate: afterSnapshot.reportDate,
      title: afterSnapshot.title,
      status: afterSnapshot.status,
      operation: action,
    },
  });
};

export const logDailyReportCommentAdd = async ({
  actorStaffId,
  before,
  after,
  comment,
}: DailyReportCommentLogParams) => {
  const beforeSnapshot = before ? buildDailyReportLogSnapshot(before) : null;
  const afterSnapshot = buildDailyReportLogSnapshot(after);

  await logOperationEvent({
    action: "daily_report.comment.add",
    resource: "daily_report",
    resourceId: afterSnapshot.id,
    actorStaffId,
    targetStaffId: afterSnapshot.staffId,
    summary: `${afterSnapshot.reportDate ?? "-"} の日報にコメントを追加`,
    before: beforeSnapshot,
    after: afterSnapshot,
    details: {
      reportDate: afterSnapshot.reportDate,
      title: afterSnapshot.title,
      status: afterSnapshot.status,
      commentId: comment.id,
      commentAuthorName: comment.authorName ?? null,
      commentCreatedAt: comment.createdAt,
      commentBodyPreview: buildBodyPreview(comment.body),
    },
  });
};

export const logDailyReportReactionUpdate = async ({
  actorStaffId,
  before,
  after,
  operation,
  reactionType,
}: DailyReportReactionLogParams) => {
  const beforeSnapshot = before ? buildDailyReportLogSnapshot(before) : null;
  const afterSnapshot = buildDailyReportLogSnapshot(after);

  await logOperationEvent({
    action: "daily_report.reaction.update",
    resource: "daily_report",
    resourceId: afterSnapshot.id,
    actorStaffId,
    targetStaffId: afterSnapshot.staffId,
    summary: `${afterSnapshot.reportDate ?? "-"} の日報リアクションを更新`,
    before: beforeSnapshot,
    after: afterSnapshot,
    details: {
      reportDate: afterSnapshot.reportDate,
      title: afterSnapshot.title,
      status: afterSnapshot.status,
      operation,
      reactionType,
    },
  });
};

export type DailyReportLogSnapshot = ReturnType<typeof buildDailyReportLogSnapshot>;
export type DailyReportLoggable = DailyReportSnapshotSource | DailyReport;
