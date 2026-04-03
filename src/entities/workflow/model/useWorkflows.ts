import {
  type UpdateWorkflowPayload,
  useCreateWorkflowMutation,
  useDeleteWorkflowMutation,
  useGetWorkflowsQuery,
  useUpdateWorkflowMutation,
} from "@entities/workflow/api/workflowApi";
import {
  CreateWorkflowInput,
  OnCreateWorkflowSubscription,
  OnDeleteWorkflowSubscription,
  OnUpdateWorkflowSubscription,
  UpdateWorkflowInput,
  Workflow as APIWorkflow,
} from "@shared/api/graphql/types";
import { useCallback, useEffect } from "react";

import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import {
  buildVersionOrUpdatedAtCondition,
  getNextVersion,
} from "@/shared/api/graphql/concurrency";
import {
  onCreateWorkflow,
  onDeleteWorkflow,
  onUpdateWorkflow,
} from "@/shared/api/graphql/documents/subscriptions";

const extractErrorMessage = (error: unknown) => {
  if (!error) {
    return null;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  if (typeof error === "string") {
    return error;
  }

  return null;
};

export type UseWorkflowsParams = {
  isAuthenticated: boolean;
};

export default function useWorkflows({ isAuthenticated }: UseWorkflowsParams) {
  const {
    data,
    isLoading: isQueryLoading,
    isFetching: isQueryFetching,
    error: queryError,
    refetch,
  } = useGetWorkflowsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [
    createWorkflowMutation,
    { isLoading: isCreating, error: createError },
  ] = useCreateWorkflowMutation();
  const [
    updateWorkflowMutation,
    { isLoading: isUpdating, error: updateError },
  ] = useUpdateWorkflowMutation();
  const [
    deleteWorkflowMutation,
    { isLoading: isDeleting, error: deleteError },
  ] = useDeleteWorkflowMutation();

  const workflows: APIWorkflow[] | null = data ?? null;
  const loading =
    isQueryLoading || isQueryFetching || isCreating || isUpdating || isDeleting;
  const errorMessage =
    extractErrorMessage(queryError) ??
    extractErrorMessage(createError) ??
    extractErrorMessage(updateError) ??
    extractErrorMessage(deleteError) ??
    null;

  const fetchWorkflows = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }
    await refetch();
  }, [isAuthenticated, refetch]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isMounted = true;
    let refetchTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRefetch = () => {
      if (refetchTimer) {
        clearTimeout(refetchTimer);
      }

      refetchTimer = setTimeout(() => {
        if (!isMounted) {
          return;
        }
        void refetch();
      }, 300);
    };

    const createSubscription = graphqlClient
      .graphql({ query: onCreateWorkflow, authMode: "userPool" })
      .subscribe({
        next: ({ data }: { data?: OnCreateWorkflowSubscription }) => {
          if (!data?.onCreateWorkflow) {
            return;
          }
          scheduleRefetch();
        },
      });

    const updateSubscription = graphqlClient
      .graphql({ query: onUpdateWorkflow, authMode: "userPool" })
      .subscribe({
        next: ({ data }: { data?: OnUpdateWorkflowSubscription }) => {
          if (!data?.onUpdateWorkflow) {
            return;
          }
          scheduleRefetch();
        },
      });

    const deleteSubscription = graphqlClient
      .graphql({ query: onDeleteWorkflow, authMode: "userPool" })
      .subscribe({
        next: ({ data }: { data?: OnDeleteWorkflowSubscription }) => {
          if (!data?.onDeleteWorkflow) {
            return;
          }
          scheduleRefetch();
        },
      });

    return () => {
      isMounted = false;
      if (refetchTimer) {
        clearTimeout(refetchTimer);
      }
      createSubscription.unsubscribe();
      updateSubscription.unsubscribe();
      deleteSubscription.unsubscribe();
    };
  }, [isAuthenticated, refetch]);

  const create = useCallback(
    async (input: CreateWorkflowInput) => {
      if (!isAuthenticated) {
        throw new Error("User is not authenticated");
      }
      const created = await createWorkflowMutation(input).unwrap();
      return created;
    },
    [createWorkflowMutation, isAuthenticated]
  );

  const update = useCallback(
    async (input: UpdateWorkflowInput) => {
      if (!isAuthenticated) {
        throw new Error("User is not authenticated");
      }
      const currentWorkflow = workflows?.find((workflow) => workflow.id === input.id);
      const updated = await updateWorkflowMutation({
        input: {
          ...input,
          version: getNextVersion(currentWorkflow?.version),
        },
        condition: buildVersionOrUpdatedAtCondition(
          currentWorkflow?.version,
          currentWorkflow?.updatedAt,
        ),
      } satisfies UpdateWorkflowPayload).unwrap();
      return updated;
    },
    [isAuthenticated, updateWorkflowMutation, workflows]
  );

  const remove = useCallback(
    async (id: string) => {
      if (!isAuthenticated) {
        throw new Error("User is not authenticated");
      }
      await deleteWorkflowMutation({ id }).unwrap();
    },
    [deleteWorkflowMutation, isAuthenticated]
  );

  return {
    workflows,
    loading,
    error: errorMessage,
    fetchWorkflows,
    create,
    update,
    remove,
  };
}
