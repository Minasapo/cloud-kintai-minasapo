import type { DailyReportFormData } from "@features/attendance/daily-report";
import type {
  DailyReportReactionType,
  DailyReportStatus,
} from "@shared/api/graphql/types";

export type ReportStatus = DailyReportStatus;
export type EditableStatus = Extract<ReportStatus, "DRAFT" | "SUBMITTED">;
export type ReactionType = DailyReportReactionType;

export interface ReportReaction {
  type: ReactionType;
  count: number;
}

export interface AdminComment {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface DailyReportItem {
  id: string;
  staffId: string;
  date: string;
  author: string;
  title: string;
  content: string;
  status: ReportStatus;
  updatedAt?: string | null;
  version?: number | null;
  createdAt?: string | null;
  reactions: ReportReaction[];
  comments: AdminComment[];
}

export type DailyReportForm = DailyReportFormData;
