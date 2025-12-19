import {
  type GetWorkflowQuery,
  type UpdateWorkflowInput,
  type WorkflowComment,
  type WorkflowCommentInput,
} from "@shared/api/graphql/types";

const defaultIdFactory = () => `c-${Date.now()}`;
const defaultDateFactory = () => new Date().toISOString();

export type WorkflowCommentBuilderOptions = {
  idFactory?: () => string;
  timestampFactory?: () => string;
};

export const extractExistingWorkflowComments = (
  workflow: NonNullable<GetWorkflowQuery["getWorkflow"]> | null
): WorkflowCommentInput[] => {
  if (!workflow?.comments) return [];
  return workflow.comments
    .filter((comment): comment is WorkflowComment => Boolean(comment))
    .map((comment) => ({
      id: comment.id,
      staffId: comment.staffId,
      text: comment.text,
      createdAt: comment.createdAt,
    }));
};

export const buildSystemWorkflowComment = (
  text: string,
  options?: WorkflowCommentBuilderOptions
): WorkflowCommentInput => {
  const idFactory = options?.idFactory ?? defaultIdFactory;
  const timestampFactory = options?.timestampFactory ?? defaultDateFactory;
  return {
    id: idFactory(),
    staffId: "system",
    text,
    createdAt: timestampFactory(),
  };
};

export const buildWorkflowCommentsUpdateInput = (
  workflow: NonNullable<GetWorkflowQuery["getWorkflow"]>,
  commentText: string,
  options?: WorkflowCommentBuilderOptions
): UpdateWorkflowInput => {
  const existing = extractExistingWorkflowComments(workflow);
  const systemComment = buildSystemWorkflowComment(commentText, options);
  return {
    id: workflow.id,
    comments: [...existing, systemComment],
  };
};
