import type { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { fetchWorkflowById } from "@entities/workflow/model/loader";
import {
  buildDynamicUpdateWorkflowInput,
  validateDynamicWorkflowForm,
} from "@features/workflow/application-form/model/dynamicWorkflowFormModel";
import { extractExistingWorkflowComments } from "@features/workflow/comment-thread/model/workflowCommentBuilder";
import type { WorkflowEntity } from "@features/workflow/hooks/useWorkflowLoaderWorkflow";
import { buildResubmissionApprovalResetInput } from "@features/workflow/lib/workflowResubmission";
import { executeWorkflowWithdraw } from "@features/workflow/lib/workflowWithdraw";
import { sendWorkflowSubmissionNotification } from "@features/workflow/notifications/sendWorkflowSubmissionNotification";
import { UpdateWorkflowInput, Workflow, WorkflowCommentInput, WorkflowStatus } from "@shared/api/graphql/types";
import { createLogger } from "@shared/lib/logger";
import type { AppNotificationInput } from "@shared/lib/useAppNotification";
import { useState } from "react";
import type { NavigateFunction } from "react-router-dom";

const logger = createLogger("useWorkflowEditActions");

type UseWorkflowEditActionsParams = {
  id?: string;
  workflow: WorkflowEntity;
  category: string;
  fields: Record<string, unknown>;
  existingComments: WorkflowCommentInput[];
  setExistingComments: (comments: WorkflowCommentInput[]) => void;
  applicant: StaffType | null;
  updateWorkflow: (input: UpdateWorkflowInput) => Promise<Workflow>;
  staffs: StaffType[];
  notify: (options: AppNotificationInput) => void;
  navigate: NavigateFunction;
  runWithoutGuard: (action: () => void) => void;
  setIsSaving: (value: boolean) => void;
};

export const useWorkflowEditActions = ({
  id,
  workflow,
  category,
  fields,
  existingComments,
  setExistingComments,
  applicant,
  updateWorkflow,
  staffs,
  notify,
  navigate,
  runWithoutGuard,
  setIsSaving,
}: UseWorkflowEditActionsParams) => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSave = (action: "draft" | "submit") => {
    const state = { categoryLabel: category, fields };
    const validation = validateDynamicWorkflowForm(state);
    setFieldErrors(validation.fieldErrors);
    if (!validation.isValid) return;

    (async () => {
      try {
        setIsSaving(true);
        if (!id) throw new Error("IDが不明です");
        const draftMode = action === "draft";
        let latestWorkflow = workflow;
        let normalizedComments = existingComments;
        if (!draftMode) {
          const latest = await fetchWorkflowById(id);
          latestWorkflow = latest;
          normalizedComments = extractExistingWorkflowComments(latest);
          setExistingComments(normalizedComments);
        }

        const baseInput = buildDynamicUpdateWorkflowInput({
          workflowId: id,
          draftMode,
          state,
          existingComments: normalizedComments,
        });

        const shouldResetApprovalChain =
          !draftMode && latestWorkflow.status === WorkflowStatus.REJECTED;
        if (shouldResetApprovalChain) {
          Object.assign(
            baseInput,
            buildResubmissionApprovalResetInput(latestWorkflow),
          );
        }

        const updatedWorkflow = await updateWorkflow(baseInput);

        if (!draftMode) {
          try {
            const workflowApplicant =
              applicant ||
              staffs.find((s) => s.id === workflow.staffId) ||
              null;
            await sendWorkflowSubmissionNotification({
              staffs,
              applicant: workflowApplicant,
              workflow: updatedWorkflow,
            });
          } catch (mailError) {
            logger.error(
              "Failed to send workflow submission notification:",
              mailError,
            );
            notify({
              title: "メール送信エラー",
              description: "管理者への通知メールの送信に失敗しました。",
              tone: "error",
              dedupeKey: "workflow-mail-error",
            });
          }
        }

        notify({
          title: draftMode ? "下書き保存しました" : "申請しました",
          tone: "success",
        });
        setTimeout(() => {
          runWithoutGuard(() => navigate(`/workflow/${id}`));
        }, 1000);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("Workflow update failed:", message);
        notify({ title: "エラー", description: message, tone: "error" });
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const handleWithdraw = async () => {
    if (!id || !workflow?.id) return;
    try {
      setIsSaving(true);
      await executeWorkflowWithdraw({ workflow, updateWorkflow });
      notify({ title: "取り下げしました", tone: "success" });
      setTimeout(() => {
        runWithoutGuard(() => navigate("/workflow"));
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Workflow withdrawal failed:", message);
      notify({ title: "エラー", description: message, tone: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return { handleSave, handleWithdraw, fieldErrors };
};
