import { getWorkflow } from "@shared/api/graphql/documents/queries";
import type { GetWorkflowQuery } from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";
import type { LoaderFunctionArgs } from "react-router-dom";

import { graphqlClient } from "@/lib/amplify/graphqlClient";

export type WorkflowDetailLoaderData = {
  workflow: NonNullable<GetWorkflowQuery["getWorkflow"]>;
};

export async function workflowDetailLoader({
  params,
}: LoaderFunctionArgs): Promise<WorkflowDetailLoaderData> {
  const id = params?.id;
  if (!id) {
    throw new Response("Workflow ID is required", { status: 404 });
  }

  try {
    const resp = (await graphqlClient.graphql({
      query: getWorkflow,
      variables: { id },
      authMode: "userPool",
    })) as GraphQLResult<GetWorkflowQuery>;

    if (resp.errors?.length) {
      throw new Response(resp.errors[0].message ?? "Failed to fetch workflow", {
        status: 500,
      });
    }

    const workflow = resp.data?.getWorkflow;
    if (!workflow) {
      throw new Response("指定されたワークフローが見つかりませんでした", {
        status: 404,
      });
    }

    return { workflow } satisfies WorkflowDetailLoaderData;
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    throw new Response(
      error instanceof Error ? error.message : "Failed to load workflow",
      { status: 500 }
    );
  }
}
