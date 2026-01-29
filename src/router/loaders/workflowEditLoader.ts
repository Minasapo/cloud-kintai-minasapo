import type { LoaderFunctionArgs } from "react-router-dom";

import {
  resolveWorkflowLoaderData,
  type WorkflowDetailLoaderData,
} from "@/entities/workflow/model/loader";

export type WorkflowEditLoaderData = WorkflowDetailLoaderData;

export async function workflowEditLoader({
  params,
}: LoaderFunctionArgs): Promise<WorkflowEditLoaderData> {
  return resolveWorkflowLoaderData(params);
}
