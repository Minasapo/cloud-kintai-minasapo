import { Workflow, WorkflowStatus } from "@shared/api/graphql/types";
import { useMemo } from "react";

const PENDING_WORKFLOW_STATUSES = new Set<WorkflowStatus>([
  WorkflowStatus.SUBMITTED,
  WorkflowStatus.PENDING,
]);

export function usePendingWorkflowCount(workflows?: Workflow[] | null) {
  const pendingWorkflowCount = useMemo(
    () =>
      (workflows ?? []).filter((workflow) =>
        workflow.status
          ? PENDING_WORKFLOW_STATUSES.has(workflow.status)
          : false,
      ).length,
    [workflows],
  );

  return { pendingWorkflowCount };
}
