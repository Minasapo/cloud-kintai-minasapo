import {
  useCreateWorkflowMutation,
  useDeleteWorkflowMutation,
  useGetWorkflowsQuery,
  useUpdateWorkflowMutation,
} from "@entities/workflow/api/workflowApi";
import {
  CreateWorkflowInput,
  UpdateWorkflowInput,
  Workflow as APIWorkflow,
} from "@shared/api/graphql/types";
import { useCallback, useContext } from "react";

import { AuthContext } from "@/context/AuthContext";

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

export default function useWorkflows() {
  const { authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";

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
      const updated = await updateWorkflowMutation(input).unwrap();
      return updated;
    },
    [isAuthenticated, updateWorkflowMutation]
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
