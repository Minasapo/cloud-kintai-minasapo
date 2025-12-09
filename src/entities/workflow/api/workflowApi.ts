import { createApi } from "@reduxjs/toolkit/query/react";

import type {
  CreateWorkflowInput,
  CreateWorkflowMutation,
  DeleteWorkflowInput,
  DeleteWorkflowMutation,
  ListWorkflowsQuery,
  UpdateWorkflowInput,
  UpdateWorkflowMutation,
  Workflow,
} from "@/API";
import {
  createWorkflow,
  deleteWorkflow,
  updateWorkflow,
} from "@/graphql/mutations";
import { listWorkflows } from "@/graphql/queries";
import { graphqlBaseQuery } from "@/lib/api/graphqlBaseQuery";

type WorkflowTag = {
  type: "Workflow";
  id: string;
};

const nonNullable = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

const buildWorkflowTagId = (workflow: { id?: string | null }) =>
  workflow.id ?? "unknown";

export const workflowApi = createApi({
  reducerPath: "workflowApi",
  baseQuery: graphqlBaseQuery(),
  tagTypes: ["Workflow"],
  endpoints: (builder) => ({
    getWorkflows: builder.query<Workflow[], void>({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        const workflows: Workflow[] = [];
        let nextToken: string | null = null;

        do {
          const result = await baseQuery({
            document: listWorkflows,
            variables: { nextToken },
          });

          if (result.error) {
            return { error: result.error };
          }

          const data = result.data as ListWorkflowsQuery | null;
          const connection = data?.listWorkflows;

          if (!connection) {
            return { error: { message: "Failed to fetch workflows" } };
          }

          workflows.push(...(connection.items?.filter(nonNullable) ?? []));
          nextToken = connection.nextToken ?? null;
        } while (nextToken);

        return { data: workflows };
      },
      providesTags: (result) => {
        const listTag: WorkflowTag = { type: "Workflow", id: "LIST" };
        if (!result) {
          return [listTag];
        }

        return [
          listTag,
          ...result.map((workflow) => ({
            type: "Workflow" as const,
            id: buildWorkflowTagId(workflow),
          })),
        ];
      },
    }),
    createWorkflow: builder.mutation<Workflow, CreateWorkflowInput>({
      async queryFn(input, _api, _extraOptions, baseQuery) {
        const result = await baseQuery({
          document: createWorkflow,
          variables: { input },
        });

        if (result.error) {
          return { error: result.error };
        }

        const data = result.data as CreateWorkflowMutation | null;
        const created = data?.createWorkflow;

        if (!created) {
          return { error: { message: "Failed to create workflow" } };
        }

        return { data: created };
      },
      invalidatesTags: (result) => {
        const listTag: WorkflowTag = { type: "Workflow", id: "LIST" };
        if (!result) {
          return [listTag];
        }

        return [
          listTag,
          { type: "Workflow" as const, id: buildWorkflowTagId(result) },
        ];
      },
    }),
    updateWorkflow: builder.mutation<Workflow, UpdateWorkflowInput>({
      async queryFn(input, _api, _extraOptions, baseQuery) {
        const result = await baseQuery({
          document: updateWorkflow,
          variables: { input },
        });

        if (result.error) {
          return { error: result.error };
        }

        const data = result.data as UpdateWorkflowMutation | null;
        const updated = data?.updateWorkflow;

        if (!updated) {
          return { error: { message: "Failed to update workflow" } };
        }

        return { data: updated };
      },
      invalidatesTags: (result) => {
        const listTag: WorkflowTag = { type: "Workflow", id: "LIST" };
        if (!result) {
          return [listTag];
        }

        return [
          listTag,
          { type: "Workflow" as const, id: buildWorkflowTagId(result) },
        ];
      },
    }),
    deleteWorkflow: builder.mutation<Workflow, DeleteWorkflowInput>({
      async queryFn(input, _api, _extraOptions, baseQuery) {
        const result = await baseQuery({
          document: deleteWorkflow,
          variables: { input },
        });

        if (result.error) {
          return { error: result.error };
        }

        const data = result.data as DeleteWorkflowMutation | null;
        const deleted = data?.deleteWorkflow;

        if (!deleted) {
          return { error: { message: "Failed to delete workflow" } };
        }

        return { data: deleted };
      },
      invalidatesTags: (result, _error, arg) => {
        const listTag: WorkflowTag = { type: "Workflow", id: "LIST" };
        const targetId = arg.id ?? buildWorkflowTagId(result ?? {});
        return [listTag, { type: "Workflow", id: targetId }];
      },
    }),
  }),
});

export const {
  useGetWorkflowsQuery,
  useCreateWorkflowMutation,
  useUpdateWorkflowMutation,
  useDeleteWorkflowMutation,
} = workflowApi;
