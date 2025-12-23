import type { LoaderFunctionArgs } from "react-router-dom";

import type { WorkflowDetailLoaderData } from "@/router/loaders/workflowDetailLoader";
import {
  fetchWorkflowById,
  WorkflowLoaderError,
} from "@/router/loaders/workflowDetailLoader";

export type WorkflowEditLoaderData = WorkflowDetailLoaderData;

export async function workflowEditLoader({
  params,
}: LoaderFunctionArgs): Promise<WorkflowEditLoaderData> {
  const id = params?.id;
  if (!id) {
    throw new Response("Workflow ID is required", { status: 404 });
  }

  try {
    const workflow = await fetchWorkflowById(id);
    return { workflow } satisfies WorkflowEditLoaderData;
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
