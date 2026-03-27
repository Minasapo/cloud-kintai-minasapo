import { getWorkflow } from "@shared/api/graphql/documents/queries";
import { onUpdateWorkflow } from "@shared/api/graphql/documents/subscriptions";
import {
  GetWorkflowQuery,
  OnUpdateWorkflowSubscription,
} from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";
import { useCallback, useEffect, useRef, useState } from "react";

import { subscribeWorkflowCommentNotifications } from "@/features/workflow/notification/model/workflowNotificationEventService";
import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import { createLogger } from "@/shared/lib/logger";

const logger = createLogger("useWorkflowDetailData");

type UseWorkflowDetailDataOptions = {
  currentStaffId?: string | null;
  onNewComment?: () => void;
};

export const useWorkflowDetailData = (
  id?: string,
  options?: UseWorkflowDetailDataOptions,
) => {
  const [workflow, setWorkflow] = useState<NonNullable<
    GetWorkflowQuery["getWorkflow"]
  > | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastNotifiedCommentIdRef = useRef<string | null>(null);

  const notifyNewComment = useCallback(
    (commentId?: string | null) => {
      if (!options?.onNewComment) return;

      if (commentId && lastNotifiedCommentIdRef.current === commentId) {
        return;
      }

      if (commentId) {
        lastNotifiedCommentIdRef.current = commentId;
      }

      options.onNewComment();
    },
    [options?.onNewComment],
  );

  const fetchWorkflow = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const resp = (await graphqlClient.graphql({
        query: getWorkflow,
        variables: { id },
        authMode: "userPool",
      })) as GraphQLResult<GetWorkflowQuery>;

      if (resp.errors?.length) {
        throw new Error(resp.errors[0].message);
      }

      if (!resp.data?.getWorkflow) {
        setError("指定されたワークフローが見つかりませんでした");
        setWorkflow(null);
      } else {
        setWorkflow(resp.data.getWorkflow);
      }
    } catch (err) {
      // log in component if needed
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ワークフロー更新（コメント含む）のサブスクリプションを購読
  useEffect(() => {
    if (!id) return;

    logger.info("Starting workflow update subscription for workflow:", { id });

    const subscription = graphqlClient
      .graphql({
        query: onUpdateWorkflow,
        variables: { filter: { id: { eq: id } } },
        authMode: "userPool",
      })
      .subscribe({
        next: ({ data }) => {
          logger.info("Workflow update subscription received data:", {
            workflowId: data?.onUpdateWorkflow?.id,
            hasComments: !!data?.onUpdateWorkflow?.comments?.length,
          });

          if (!data?.onUpdateWorkflow) {
            logger.warn("No workflow data in subscription");
            return;
          }

          const updatedWorkflow = data.onUpdateWorkflow as NonNullable<
            OnUpdateWorkflowSubscription["onUpdateWorkflow"]
          >;
          logger.info("Workflow updated via subscription:", {
            id: updatedWorkflow.id,
            commentCount: updatedWorkflow.comments?.length ?? 0,
          });

          const latestComment =
            updatedWorkflow.comments?.[updatedWorkflow.comments.length - 1];
          const isOwnComment =
            Boolean(options?.currentStaffId) &&
            latestComment?.staffId === options?.currentStaffId;
          if (!isOwnComment && latestComment?.id) {
            notifyNewComment(latestComment.id);
          }

          setWorkflow(
            updatedWorkflow as NonNullable<GetWorkflowQuery["getWorkflow"]>,
          );
        },
        error: (error) => {
          logger.error("Workflow update subscription error:", error);
        },
      });

    return () => {
      logger.info("Unsubscribing from workflow update subscription:", { id });
      subscription.unsubscribe();
    };
  }, [id, notifyNewComment, options?.currentStaffId]);

  useEffect(() => {
    if (!id || !options?.currentStaffId || !options?.onNewComment) return;

    logger.info("Starting workflow notification subscription:", {
      workflowId: id,
      recipientStaffId: options.currentStaffId,
    });

    const unsubscribe = subscribeWorkflowCommentNotifications({
      workflowId: id,
      recipientStaffId: options.currentStaffId,
      onReceived: (event) => {
        notifyNewComment(event.commentId);
      },
      onError: (subscriptionError) => {
        logger.error(
          "Workflow notification subscription error:",
          subscriptionError,
        );
      },
    });

    return () => {
      logger.info("Unsubscribing from workflow notification subscription:", {
        workflowId: id,
        recipientStaffId: options.currentStaffId,
      });
      unsubscribe();
    };
  }, [id, notifyNewComment, options?.currentStaffId, options?.onNewComment]);

  useEffect(() => {
    void fetchWorkflow();
  }, [fetchWorkflow]);

  return {
    workflow,
    setWorkflow,
    loading,
    error,
    refetchWorkflow: fetchWorkflow,
  };
};
