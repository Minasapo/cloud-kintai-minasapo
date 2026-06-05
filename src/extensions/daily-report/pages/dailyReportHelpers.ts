import type {
  DailyReport as DailyReportModel,
  DailyReportComment,
  DailyReportReaction,
} from "@shared/api/graphql/types";
import { formatRelativeDateTime } from "@shared/lib/time";

import type {
  AdminComment,
  DailyReportForm,
  DailyReportItem,
  ReactionType,
  ReportReaction,
} from "./dailyReportTypes";

export const formatDateInput = (value: Date) => value.toISOString().slice(0, 10);

export const buildDefaultTitle = (date: string) =>
  date ? `${date}の日報` : "日報";

export const buildSavedAtLabel = (savedAt?: string | null) =>
  formatRelativeDateTime(savedAt) || savedAt || "";

export const emptyForm = (
  initialDate?: string,
  initialAuthor?: string,
): DailyReportForm => {
  const date = initialDate ?? formatDateInput(new Date());
  return {
    date,
    author: initialAuthor ?? "",
    title: buildDefaultTitle(date),
    content: "",
  };
};

const aggregateReactions = (
  entries?: (DailyReportReaction | null)[] | null,
): ReportReaction[] => {
  if (!entries?.length) return [];
  const counts = new Map<ReactionType, number>();
  entries
    .filter((entry): entry is DailyReportReaction => Boolean(entry))
    .forEach((entry) => {
      const type = entry.type as ReactionType;
      counts.set(type, (counts.get(type) ?? 0) + 1);
    });
  return Array.from(counts.entries()).map(([type, count]) => ({ type, count }));
};

const mapComments = (
  entries?: (DailyReportComment | null)[] | null,
): AdminComment[] => {
  if (!entries?.length) return [];
  return entries
    .filter((entry): entry is DailyReportComment => Boolean(entry))
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((entry) => ({
      id: entry.id,
      author: entry.authorName || "管理者",
      body: entry.body,
      createdAt: entry.createdAt,
    }));
};

export const mapDailyReport = (
  record: DailyReportModel,
  authorFallback: string,
): DailyReportItem => ({
  id: record.id,
  staffId: record.staffId,
  date: record.reportDate,
  author: authorFallback,
  title: record.title,
  content: record.content ?? "",
  status: record.status,
  updatedAt: record.updatedAt ?? record.createdAt ?? null,
  version: record.version,
  createdAt: record.createdAt ?? null,
  reactions: aggregateReactions(record.reactions),
  comments: mapComments(record.comments),
});

export const sortReports = (items: DailyReportItem[]) =>
  items.toSorted((a, b) => {
    if (a.date === b.date) {
      const aTime = a.updatedAt ?? "";
      const bTime = b.updatedAt ?? "";
      return bTime.localeCompare(aTime);
    }
    return b.date.localeCompare(a.date);
  });
