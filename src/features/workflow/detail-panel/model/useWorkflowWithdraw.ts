import type { WorkflowEntity } from "@features/workflow/hooks/useWorkflowLoaderWorkflow";
import { executeWorkflowWithdraw } from "@features/workflow/lib/workflowWithdraw";
import { UpdateWorkflowInput } from "@shared/api/graphql/types";
import { createLogger } from "@shared/lib/logger";
import type { AppNotificationInput } from "@shared/lib/useAppNotification";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const logger = createLogger("useWorkflowWithdraw");

type UseWorkflowWithdrawParams = {
  workflow: WorkflowEntity | null | undefined;
  updateWorkflow: (input: UpdateWorkflowInput) => Promise<unknown>;
  setWorkflow: (workflow: WorkflowEntity) => void;
  notify: (input: AppNotificationInput) => void;
  navigate: ReturnType<typeof useNavigate>;
};

export function useWorkflowWithdraw({
  workflow,
  updateWorkflow,
  setWorkflow,
  notify,
  navigate,
}: UseWorkflowWithdrawParams) {
  const executeWithdraw = useCallback(async () => {
    if (!workflow?.id) return;

    try {
      await executeWorkflowWithdraw({
        workflow,
        updateWorkflow,
        onWorkflowChange: setWorkflow,
      });

      notify({ title: "取り下げしました", tone: "success" });
      setTimeout(() => navigate("/workflow"), 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Workflow withdrawal failed:", message);
      notify({
        title: "エラー",
        description: message,
        tone: "error",
      });
    }
  }, [workflow, updateWorkflow, setWorkflow, notify, navigate]);

  return { executeWithdraw };
}
