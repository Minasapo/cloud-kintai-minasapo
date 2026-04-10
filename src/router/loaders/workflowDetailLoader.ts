import {
  resolveWorkflowLoaderData,
  type WorkflowDetailLoaderData,
} from "@entities/workflow/model/loader";
import type { LoaderFunctionArgs } from "react-router-dom";

export async function workflowDetailLoader({
  params,
}: LoaderFunctionArgs): Promise<WorkflowDetailLoaderData> {
  return resolveWorkflowLoaderData(params);
}
