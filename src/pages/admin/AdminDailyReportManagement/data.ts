import {
  type DailyReport as DailyReportModel,
  type DailyReportComment,
  type DailyReportReaction,
  DailyReportReactionType,
  DailyReportStatus,
} from "@/API";

export type ReportStatus = DailyReportStatus;
export type DisplayStatus = Exclude<ReportStatus, DailyReportStatus.DRAFT>;

export type ReactionType = DailyReportReactionType;

export type ReportReaction = {
  type: ReactionType;
  count: number;
};

export type AdminComment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

export type AdminDailyReport = {
  id: string;
  staffId: string;
  date: string;
  author: string;
  title: string;
  content: string;
  status: ReportStatus;
  updatedAt: string;
  createdAt?: string | null;
  reactions: ReportReaction[];
  comments: AdminComment[];
};

export const STATUS_META: Record<
  ReportStatus,
  { label: string; color: "default" | "info" | "success" }
> = {
  [DailyReportStatus.DRAFT]: { label: "下書き", color: "default" },
  [DailyReportStatus.SUBMITTED]: { label: "提出済", color: "info" },
  [DailyReportStatus.APPROVED]: { label: "確認済", color: "success" },
};

export const DISPLAY_STATUSES: DisplayStatus[] = [
  DailyReportStatus.SUBMITTED,
  DailyReportStatus.APPROVED,
];

export const REACTION_META: Record<
  ReactionType,
  { label: string; emoji: string }
> = {
  [DailyReportReactionType.CHEER]: { label: "GOOD", emoji: "👍" },
  [DailyReportReactionType.CHECK]: { label: "確認済", emoji: "✅" },
  [DailyReportReactionType.THANKS]: { label: "感謝", emoji: "🙌" },
  [DailyReportReactionType.LOOK]: { label: "見ました", emoji: "👀" },
};

export const aggregateReactions = (
  entries?: (DailyReportReaction | null)[] | null
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

export const mapComments = (
  entries?: (DailyReportComment | null)[] | null
): AdminComment[] => {
  if (!entries?.length) return [];
  return entries
    .filter((entry): entry is DailyReportComment => Boolean(entry))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((entry) => ({
      id: entry.id,
      author: entry.authorName || "管理者",
      body: entry.body,
      createdAt: entry.createdAt,
    }));
};

export const mapDailyReport = (
  record: DailyReportModel,
  authorName: string
): AdminDailyReport => ({
  id: record.id,
  staffId: record.staffId,
  date: record.reportDate,
  author: authorName,
  title: record.title,
  content: record.content ?? "",
  status: record.status,
  updatedAt: record.updatedAt ?? record.createdAt ?? "",
  createdAt: record.createdAt ?? null,
  reactions: aggregateReactions(record.reactions),
  comments: mapComments(record.comments),
});
