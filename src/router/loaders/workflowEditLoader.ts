import type { LoaderFunctionArgs } from "react-router-dom";

import type { WorkflowDetailLoaderData } from "@/router/loaders/workflowDetailLoader";
import { resolveWorkflowLoaderData } from "@/router/loaders/workflowDetailLoader";

export type WorkflowEditLoaderData = WorkflowDetailLoaderData;

export async function workflowEditLoader({
  params,
}: LoaderFunctionArgs): Promise<WorkflowEditLoaderData> {
  return resolveWorkflowLoaderData(params);
}
