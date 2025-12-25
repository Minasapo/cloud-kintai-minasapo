import { getWorkflow } from "@shared/api/graphql/documents/queries";
import type { GetWorkflowQuery } from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";
import type { LoaderFunctionArgs } from "react-router-dom";

import { graphqlClient } from "@/lib/amplify/graphqlClient";

export type WorkflowDetailLoaderData = {
  workflow: NonNullable<GetWorkflowQuery["getWorkflow"]>;
};

export class WorkflowLoaderError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function fetchWorkflowById(
  id: string
): Promise<NonNullable<GetWorkflowQuery["getWorkflow"]>> {
  const resp = (await graphqlClient.graphql({
    query: getWorkflow,
    variables: { id },
    authMode: "userPool",
  })) as GraphQLResult<GetWorkflowQuery>;

  if (resp.errors?.length) {
    throw new WorkflowLoaderError(
      resp.errors[0].message ?? "Failed to fetch workflow",
      500
    );
  }

  const workflow = resp.data?.getWorkflow;
  if (!workflow) {
    throw new WorkflowLoaderError(
      "指定されたワークフローが見つかりませんでした",
      404
    );
  }

  return workflow;
}

export async function resolveWorkflowLoaderData(
  params: LoaderFunctionArgs["params"]
): Promise<WorkflowDetailLoaderData> {
  const id = params?.id;
  if (!id) {
    throw new Response("Workflow ID is required", { status: 404 });
  }

  try {
    const workflow = await fetchWorkflowById(id);
    return { workflow } satisfies WorkflowDetailLoaderData;
  } catch (error) {
    if (error instanceof WorkflowLoaderError) {
      throw new Response(error.message, { status: error.status });
    }

    throw new Response(
      error instanceof Error ? error.message : "Failed to load workflow",
      { status: 500 }
    );
  }
}

export async function workflowDetailLoader({
  params,
}: LoaderFunctionArgs): Promise<WorkflowDetailLoaderData> {
  return resolveWorkflowLoaderData(params);
}
