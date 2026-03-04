import { updateWorkflow } from "@shared/api/graphql/documents/mutations";
import { getWorkflow } from "@shared/api/graphql/documents/queries";
import type {
  GetWorkflowQuery,
  ModelWorkflowConditionInput,
  UpdateWorkflowInput,
  UpdateWorkflowMutation,
  WorkflowComment,
  WorkflowCommentInput,
} from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";

import {
  NotificationStaff,
  publishWorkflowCommentNotifications,
} from "@/features/workflow/notification/model/workflowNotificationEventService";
import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import { createLogger } from "@/shared/lib/logger";

const logger = createLogger("submitWorkflowComment");

type WorkflowData = NonNullable<GetWorkflowQuery["getWorkflow"]>;

type SubmitWorkflowCommentArgs = {
  workflowId: string;
  newComment: WorkflowCommentInput;
  actorStaffId: string;
  actorDisplayName: string;
  staffs: NotificationStaff[];
};

const MAX_RETRIES = 3;

const toCommentInputs = (
  comments: Array<WorkflowComment | null> | null | undefined,
) =>
  (comments ?? [])
    .filter((comment): comment is WorkflowComment => Boolean(comment))
    .map((comment) => ({
      id: comment.id,
      staffId: comment.staffId,
      text: comment.text,
      createdAt: comment.createdAt,
    }));

const isConditionalCheckFailed = (message: string) =>
  message.includes("ConditionalCheckFailed") ||
  message.includes("The conditional request failed");

const wait = async (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });

export const submitWorkflowComment = async ({
  workflowId,
  newComment,
  actorStaffId,
  actorDisplayName,
  staffs,
}: SubmitWorkflowCommentArgs): Promise<WorkflowData> => {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    const latestResult = (await graphqlClient.graphql({
      query: getWorkflow,
      variables: { id: workflowId },
      authMode: "userPool",
    })) as GraphQLResult<GetWorkflowQuery>;

    if (latestResult.errors?.length) {
      throw new Error(latestResult.errors[0].message);
    }

    const latestWorkflow = latestResult.data?.getWorkflow;
    if (!latestWorkflow) {
      throw new Error("指定されたワークフローが見つかりませんでした");
    }

    const existingComments = toCommentInputs(latestWorkflow.comments);
    const alreadyExists = existingComments.some(
      (comment) => comment.id === newComment.id,
    );
    if (alreadyExists) {
      return latestWorkflow as WorkflowData;
    }

    const input: UpdateWorkflowInput = {
      id: workflowId,
      comments: [...existingComments, newComment],
    };

    const condition: ModelWorkflowConditionInput | undefined =
      latestWorkflow.updatedAt
        ? { updatedAt: { eq: latestWorkflow.updatedAt } }
        : undefined;

    const updateResult = (await graphqlClient.graphql({
      query: updateWorkflow,
      variables: { input, condition },
      authMode: "userPool",
    })) as GraphQLResult<UpdateWorkflowMutation>;

    if (updateResult.errors?.length) {
      const message = updateResult.errors[0].message;
      const canRetry =
        attempt < MAX_RETRIES - 1 && isConditionalCheckFailed(message);

      if (canRetry) {
        logger.warn("Retrying workflow comment submit after conflict", {
          workflowId,
          attempt: attempt + 1,
        });
        await wait((attempt + 1) * 80);
        continue;
      }

      throw new Error(message);
    }

    const updatedWorkflow = updateResult.data?.updateWorkflow;
    if (!updatedWorkflow) {
      throw new Error("コメント更新結果を取得できませんでした");
    }

    const workflowForNotification: WorkflowData = {
      ...(latestWorkflow as WorkflowData),
      ...(updatedWorkflow as WorkflowData),
    };

    await publishWorkflowCommentNotifications({
      workflow: workflowForNotification,
      actorStaffId,
      actorDisplayName,
      commentId: newComment.id,
      staffs,
    });

    return updatedWorkflow as WorkflowData;
  }

  throw new Error(
    "コメント送信の競合が解決できませんでした。再度お試しください。",
  );
};
