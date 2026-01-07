import type { GetWorkflowQuery } from "@shared/api/graphql/types";
import { useEffect, useState } from "react";

export type WorkflowEntity = NonNullable<GetWorkflowQuery["getWorkflow"]>;

export function useWorkflowLoaderWorkflow(
  initialWorkflow: WorkflowEntity | null
) {
  const [workflow, setWorkflow] = useState<WorkflowEntity | null>(
    initialWorkflow
  );

  useEffect(() => {
    setWorkflow(initialWorkflow);
  }, [initialWorkflow]);

  return { workflow, setWorkflow } as const;
}
