import { getWorkflow } from "@shared/api/graphql/documents/queries";
import { onUpdateWorkflow } from "@shared/api/graphql/documents/subscriptions";
import type { GetWorkflowQuery } from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";
import { useCallback, useEffect, useRef, useState } from "react";

import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import { createLogger } from "@/shared/lib/logger";

const logger = createLogger("useWorkflowLoaderWorkflow");

export type WorkflowEntity = NonNullable<GetWorkflowQuery["getWorkflow"]>;

type UseWorkflowLoaderWorkflowOptions = {
  currentStaffId?: string | null;
  onNewComment?: () => void;
};

export function useWorkflowLoaderWorkflow(
  initialWorkflow: WorkflowEntity | null,
  options?: UseWorkflowLoaderWorkflowOptions,
) {
  const [workflow, setWorkflow] = useState<WorkflowEntity | null>(
    initialWorkflow,
  );
  const previousCommentCountRef = useRef<number | null>(
    initialWorkflow?.comments?.length ?? null,
  );

  useEffect(() => {
    setWorkflow(initialWorkflow);
    previousCommentCountRef.current = initialWorkflow?.comments?.length ?? null;
  }, [initialWorkflow]);

  // 最新のワークフロー情報を取得（コメント競合を防ぐため）
  const refetchWorkflow = useCallback(async () => {
    if (!workflow?.id) return;

    try {
      logger.info("Refetching workflow to get latest data:", {
        id: workflow.id,
      });

      const resp = (await graphqlClient.graphql({
        query: getWorkflow,
        variables: { id: workflow.id },
        authMode: "userPool",
      })) as GraphQLResult<GetWorkflowQuery>;

      if (resp.errors?.length) {
        throw new Error(resp.errors[0].message);
      }

      if (!resp.data?.getWorkflow) {
        throw new Error("Workflow not found");
      }

      const updatedWorkflow = resp.data.getWorkflow as WorkflowEntity;
      logger.info("Workflow refetch successful:", {
        id: updatedWorkflow.id,
        commentCount: updatedWorkflow.comments?.length ?? 0,
      });

      setWorkflow(updatedWorkflow);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Workflow refetch failed:", message);
      throw err;
    }
  }, [workflow?.id]);

  // ワークフロー更新（コメント含む）のサブスクリプションを購読
  useEffect(() => {
    if (!workflow?.id) return;

    logger.info("Starting workflow update subscription for workflow:", {
      id: workflow.id,
    });

    const subscription = graphqlClient
      .graphql({
        query: onUpdateWorkflow,
        variables: { filter: { id: { eq: workflow.id } } },
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

          const updatedWorkflow = data.onUpdateWorkflow as WorkflowEntity;
          const previousCommentCount = previousCommentCountRef.current;
          const currentCommentCount = updatedWorkflow.comments?.length ?? 0;
          const isNewCommentReceived =
            previousCommentCount !== null &&
            currentCommentCount > previousCommentCount;

          if (isNewCommentReceived) {
            const latestComment =
              updatedWorkflow.comments?.[currentCommentCount - 1];
            const isOwnComment =
              Boolean(options?.currentStaffId) &&
              latestComment?.staffId === options?.currentStaffId;
            if (!isOwnComment) {
              options?.onNewComment?.();
            }
          }

          previousCommentCountRef.current = currentCommentCount;
          logger.info("Workflow updated via subscription:", {
            id: updatedWorkflow.id,
            commentCount: updatedWorkflow.comments?.length ?? 0,
          });

          setWorkflow(updatedWorkflow);
        },
        error: (error) => {
          logger.error("Workflow update subscription error:", error);
        },
      });

    return () => {
      logger.info("Unsubscribing from workflow update subscription:", {
        id: workflow.id,
      });
      subscription.unsubscribe();
    };
  }, [workflow?.id, options?.currentStaffId, options?.onNewComment]);

  return { workflow, setWorkflow, refetchWorkflow } as const;
}
