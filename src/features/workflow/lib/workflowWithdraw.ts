import { buildWorkflowCommentsUpdateInput } from "@features/workflow/comment-thread/model/workflowCommentBuilder";
import type { WorkflowEntity } from "@features/workflow/hooks/useWorkflowLoaderWorkflow";
import { UpdateWorkflowInput, WorkflowStatus } from "@shared/api/graphql/types";

type WithdrawWorkflowParams = {
  workflow: WorkflowEntity;
  updateWorkflow: (input: UpdateWorkflowInput) => Promise<unknown>;
  onWorkflowChange?: (workflow: WorkflowEntity) => void;
};

export async function executeWorkflowWithdraw({
  workflow,
  updateWorkflow,
  onWorkflowChange,
}: WithdrawWorkflowParams): Promise<WorkflowEntity> {
  const statusInput: UpdateWorkflowInput = {
    id: workflow.id,
    status: WorkflowStatus.CANCELLED,
  };
  const afterStatus = (await updateWorkflow(statusInput)) as WorkflowEntity;
  onWorkflowChange?.(afterStatus);

  const commentUpdate = buildWorkflowCommentsUpdateInput(
    afterStatus,
    "申請が取り下げされました",
  );
  const afterComments = (await updateWorkflow(commentUpdate)) as WorkflowEntity;
  onWorkflowChange?.(afterComments);

  return afterComments;
}