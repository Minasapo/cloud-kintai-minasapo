import { createContext, useContext } from "react";

import type { WorkflowDetailPermissions } from "./workflowDetailPermissions";

type WorkflowDetailContextValue = {
  permissions: WorkflowDetailPermissions;
  onBack: () => void;
  onWithdraw: () => void;
  onEdit: () => void;
};

export const WorkflowDetailContext =
  createContext<WorkflowDetailContextValue | null>(null);

export function useWorkflowDetailContext(): WorkflowDetailContextValue {
  const ctx = useContext(WorkflowDetailContext);
  if (!ctx) {
    throw new Error(
      "useWorkflowDetailContext must be used within WorkflowDetailContext.Provider",
    );
  }
  return ctx;
}
