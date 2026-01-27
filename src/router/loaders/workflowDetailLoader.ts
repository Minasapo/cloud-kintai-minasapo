import type { LoaderFunctionArgs } from "react-router-dom";

import {
  resolveWorkflowLoaderData,
  type WorkflowDetailLoaderData,
} from "@/entities/workflow/model/loader";

export async function workflowDetailLoader({
  params,
}: LoaderFunctionArgs): Promise<WorkflowDetailLoaderData> {
  return resolveWorkflowLoaderData(params);
}
