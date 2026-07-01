import { GetWorkflowQuery } from "@shared/api/graphql/types";
import { createLogger } from "@shared/lib/logger";
import { AppNotificationInput } from "@shared/lib/useAppNotification";
import { useCallback, useEffect, useState } from "react";

import { WorkflowRepairPlan } from "../services/workflowRepair";

type WorkflowData = NonNullable<GetWorkflowQuery["getWorkflow"]>;

type UseWorkflowRepairParams = {
  workflowId?: string | null;
  workflowRepairPlan: WorkflowRepairPlan | null;
  executeRepair: (input: WorkflowRepairPlan["input"]) => Promise<WorkflowData>;
  onRepaired: (workflow: WorkflowData) => void;
  notify: (options: AppNotificationInput) => void;
};

const logger = createLogger("useWorkflowRepair");

export const useWorkflowRepair = ({
  workflowId,
  workflowRepairPlan,
  executeRepair,
  onRepaired,
  notify,
}: UseWorkflowRepairParams) => {
  const [isRepairConfirmOpen, setIsRepairConfirmOpen] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairStep, setRepairStep] = useState(0);
  const [repairCompleted, setRepairCompleted] = useState(false);
  const [isCheckingRepairNeed, setIsCheckingRepairNeed] = useState(false);
  const [dialogRepairPlan, setDialogRepairPlan] =
    useState<WorkflowRepairPlan | null>(null);

  const handleRepairClick = useCallback(() => {
    if (!workflowId) return;
    setIsCheckingRepairNeed(true);
    setDialogRepairPlan(null);
    setRepairStep(0);
    setRepairCompleted(false);
    setIsRepairConfirmOpen(true);
  }, [workflowId]);

  useEffect(() => {
    if (!isRepairConfirmOpen || !isCheckingRepairNeed) {
      return;
    }
    const timerId = window.setTimeout(() => {
      setDialogRepairPlan(workflowRepairPlan);
      setRepairStep(workflowRepairPlan ? 1 : 0);
      setIsCheckingRepairNeed(false);
    }, 200);
    return () => {
      window.clearTimeout(timerId);
    };
  }, [isCheckingRepairNeed, isRepairConfirmOpen, workflowRepairPlan]);

  const handleRepairConfirm = useCallback(async () => {
    if (!workflowId || !dialogRepairPlan) return;
    setIsRepairing(true);
    setRepairStep(2);
    try {
      const repaired = await executeRepair(dialogRepairPlan.input);
      onRepaired(repaired);
      setRepairCompleted(true);
      notify({
        title: "修復しました",
        description: dialogRepairPlan.successMessage,
        tone: "success",
        dedupeKey: `workflow-repair-${workflowId}`,
      });
      setTimeout(() => {
        setIsRepairConfirmOpen(false);
        setIsRepairing(false);
        setRepairStep(0);
        setRepairCompleted(false);
        setIsCheckingRepairNeed(false);
        setDialogRepairPlan(null);
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Workflow repair failed:", message);
      notify({
        title: "修復に失敗しました",
        description: message,
        tone: "error",
        dedupeKey: `workflow-repair-error-${workflowId ?? "unknown"}`,
      });
      setIsRepairing(false);
      setRepairStep(1);
    }
  }, [dialogRepairPlan, executeRepair, notify, onRepaired, workflowId]);

  const handleRepairDialogClose = useCallback(() => {
    if (!isRepairing) {
      setIsRepairConfirmOpen(false);
      setRepairStep(0);
      setRepairCompleted(false);
      setIsCheckingRepairNeed(false);
      setDialogRepairPlan(null);
    }
  }, [isRepairing]);

  return {
    isRepairConfirmOpen,
    isRepairing,
    repairStep,
    repairCompleted,
    isCheckingRepairNeed,
    dialogRepairPlan,
    handleRepairClick,
    handleRepairConfirm,
    handleRepairDialogClose,
  };
};
