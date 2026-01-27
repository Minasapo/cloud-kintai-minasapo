import type { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import type { WorkflowComment } from "@shared/api/graphql/types";

import type { WorkflowCommentMessage } from "../types";

export type CommentsToWorkflowMessagesOptions = {
  generateId?: () => string;
  formatTimestamp?: (iso?: string | null) => string;
};

const defaultGenerateId = () => `c-${Date.now()}`;
const defaultFormatTimestamp = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString() : "";

export const formatWorkflowCommentSender = (sender?: string | null): string => {
  const value = (sender ?? "").trim();
  if (!value) return "システム";
  const normalized = value.toLowerCase();
  if (
    normalized === "system" ||
    normalized.startsWith("system") ||
    normalized.includes("bot")
  ) {
    return "システム";
  }
  return value;
};

export const commentsToWorkflowMessages = (
  comments: Array<WorkflowComment | null | undefined> | null | undefined,
  staffs: StaffType[],
  options?: CommentsToWorkflowMessagesOptions
): WorkflowCommentMessage[] => {
  if (!comments) return [];
  const generateId = options?.generateId ?? defaultGenerateId;
  const formatTimestamp = options?.formatTimestamp ?? defaultFormatTimestamp;

  return comments
    .filter((comment): comment is WorkflowComment => Boolean(comment))
    .map((comment) => {
      const staff = comment.staffId
        ? staffs.find((s) => s.id === comment.staffId)
        : undefined;
      const staffName = staff
        ? `${staff.familyName ?? ""} ${staff.givenName ?? ""}`.trim()
        : "";
      const sender = staffName
        ? staffName
        : formatWorkflowCommentSender(comment.staffId);

      return {
        id: comment.id ?? generateId(),
        sender,
        staffId: comment.staffId ?? undefined,
        text: comment.text,
        time: formatTimestamp(comment.createdAt),
      } satisfies WorkflowCommentMessage;
    });
};

export const shouldTruncateWorkflowMessage = (
  text: string,
  expanded: boolean
): boolean => {
  if (expanded) return false;
  const lineCount = text.split("\n").length;
  if (lineCount > 5) return true;
  if (text.length > 800) return true;
  return false;
};
