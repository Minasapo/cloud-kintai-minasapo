import { store } from "@/app/store";
import { workflowApi } from "@/entities/workflow/api/workflowApi";

export async function workflowListLoader(): Promise<null> {
  await store
    .dispatch(
      workflowApi.endpoints.getWorkflows.initiate(undefined, {
        subscribe: false,
      }),
    )
    .unwrap()
    .catch(() => undefined);

  return null;
}
