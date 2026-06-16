import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import {
  buildVersionOrUpdatedAtCondition,
  getGraphQLErrorMessage,
  getNextVersion,
} from "@shared/api/graphql/concurrency";
import { updateDailyReport } from "@shared/api/graphql/documents/mutations";
import type {
  DailyReportComment,
  DailyReportReaction,
  UpdateDailyReportMutation,
} from "@shared/api/graphql/types";
import type { GraphQLResult } from "aws-amplify/api";

import type { AdminDailyReport, ReactionType } from "../data";

export interface DailyReportBeforeSnapshot {
  id: string;
  staffId: string;
  reportDate: string;
  title: string;
  content: string;
  status: AdminDailyReport["status"];
  reactions: DailyReportReaction[];
  comments: DailyReportComment[];
  createdAt: string | null;
  updatedAt: string;
  version: number | null;
}

type UpdatedDailyReportRecord = NonNullable<
  UpdateDailyReportMutation["updateDailyReport"]
>;

interface UpdateDailyReportReactionParams {
  report: AdminDailyReport;
  reactionEntries: DailyReportReaction[];
  currentStaffId: string;
  type: ReactionType;
}

interface AddDailyReportCommentParams {
  report: AdminDailyReport;
  commentEntries: DailyReportComment[];
  currentStaffId: string;
  currentStaffName: string;
  body: string;
}

export const buildDailyReportBeforeSnapshot = (
  report: AdminDailyReport,
  reactionEntries: DailyReportReaction[] | null,
  commentEntries: DailyReportComment[] | null,
): DailyReportBeforeSnapshot => ({
  id: report.id,
  staffId: report.staffId,
  reportDate: report.date,
  title: report.title,
  content: report.content,
  status: report.status,
  reactions: reactionEntries ?? [],
  comments: commentEntries ?? [],
  createdAt: report.createdAt ?? null,
  updatedAt: report.updatedAt,
  version: report.version ?? null,
});

const getUpdatedDailyReport = (
  response: GraphQLResult<UpdateDailyReportMutation>,
  fallbackMessage: string,
): UpdatedDailyReportRecord => {
  if (response.errors?.length) {
    throw new Error(getGraphQLErrorMessage(response.errors, fallbackMessage));
  }

  const updated = response.data?.updateDailyReport;
  if (!updated) {
    throw new Error(fallbackMessage);
  }

  return updated;
};

export async function updateDailyReportReaction({
  report,
  reactionEntries,
  currentStaffId,
  type,
}: UpdateDailyReportReactionParams): Promise<{
  updated: UpdatedDailyReportRecord;
  operation: "add" | "remove";
}> {
  const hasReaction = reactionEntries.some(
    (entry) => entry.staffId === currentStaffId && entry.type === type,
  );
  const timestamp = new Date().toISOString();
  const nextEntries = hasReaction
    ? reactionEntries.filter(
        (entry) => entry.staffId !== currentStaffId || entry.type !== type,
      )
    : [
        ...reactionEntries,
        {
          __typename: "DailyReportReaction" as const,
          staffId: currentStaffId,
          type,
          createdAt: timestamp,
        },
      ];

  const response = (await graphqlClient.graphql({
    query: updateDailyReport,
    variables: {
      condition: buildVersionOrUpdatedAtCondition(report.version, report.updatedAt),
      input: {
        id: report.id,
        reactions: nextEntries.map(({ staffId, type: reactionType, createdAt }) => ({
          staffId,
          type: reactionType,
          createdAt,
        })),
        updatedAt: timestamp,
        version: getNextVersion(report.version),
      },
    },
    authMode: "userPool",
  })) as GraphQLResult<UpdateDailyReportMutation>;

  return {
    updated: getUpdatedDailyReport(
      response,
      "リアクションの更新に失敗しました。",
    ),
    operation: hasReaction ? "remove" : "add",
  };
}

export async function addDailyReportComment({
  report,
  commentEntries,
  currentStaffId,
  currentStaffName,
  body,
}: AddDailyReportCommentParams): Promise<{
  updated: UpdatedDailyReportRecord;
  addedComment: DailyReportComment;
}> {
  const timestamp = new Date().toISOString();
  const addedComment: DailyReportComment = {
    __typename: "DailyReportComment",
    id: `admin-comment-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    staffId: currentStaffId,
    authorName: currentStaffName,
    body,
    createdAt: timestamp,
  };

  const response = (await graphqlClient.graphql({
    query: updateDailyReport,
    variables: {
      condition: buildVersionOrUpdatedAtCondition(report.version, report.updatedAt),
      input: {
        id: report.id,
        comments: [addedComment, ...commentEntries].map(
          ({
            id,
            staffId,
            authorName,
            body: commentBody,
            createdAt,
          }) => ({
            id,
            staffId,
            authorName,
            body: commentBody,
            createdAt,
          }),
        ),
        updatedAt: timestamp,
        version: getNextVersion(report.version),
      },
    },
    authMode: "userPool",
  })) as GraphQLResult<UpdateDailyReportMutation>;

  return {
    updated: getUpdatedDailyReport(response, "コメントの更新に失敗しました。"),
    addedComment,
  };
}
