import {
  buildSystemWorkflowComment,
  type WorkflowCommentBuilderOptions,
} from "@features/workflow/comment-thread/model/workflowCommentBuilder";
import {
  type CreateWorkflowInput,
  type UpdateWorkflowInput,
  WorkflowCategory,
  type WorkflowCommentInput,
  WorkflowStatus,
} from "@shared/api/graphql/types";

import { REVERSE_CATEGORY } from "@/lib/workflowLabels";

const VACATION_LABEL = "有給休暇申請";
const ABSENCE_LABEL = "欠勤申請";
const OVERTIME_LABEL = "残業申請";

const defaultOvertimeDateFactory = () => new Date().toISOString().slice(0, 10);

export type WorkflowFormState = {
  categoryLabel: string;
  startDate: string;
  endDate: string;
  absenceDate: string;
  overtimeDate: string;
  overtimeStart: string;
  overtimeEnd: string;
  overtimeReason: string;
};

export type WorkflowFormErrors = {
  dateError?: string;
  absenceDateError?: string;
  overtimeDateError?: string;
  overtimeError?: string;
};

export type WorkflowFormValidationResult = {
  isValid: boolean;
  errors: WorkflowFormErrors;
};

export const validateWorkflowForm = (
  state: WorkflowFormState
): WorkflowFormValidationResult => {
  const errors: WorkflowFormErrors = {};

  if (state.categoryLabel === VACATION_LABEL) {
    if (!state.startDate || !state.endDate) {
      errors.dateError = "開始日と終了日を入力してください";
    } else if (state.startDate > state.endDate) {
      errors.dateError = "開始日は終了日以前にしてください";
    }
  }

  if (state.categoryLabel === ABSENCE_LABEL && !state.absenceDate) {
    errors.absenceDateError = "欠勤日を入力してください";
  }

  if (state.categoryLabel === OVERTIME_LABEL) {
    if (!state.overtimeDate) {
      errors.overtimeDateError = "残業予定日を入力してください";
    }
    if (!state.overtimeStart || !state.overtimeEnd) {
      errors.overtimeError = "開始時刻と終了時刻を入力してください";
    } else if (state.overtimeStart >= state.overtimeEnd) {
      errors.overtimeError = "開始時刻は終了時刻より前にしてください";
    }
  }

  const isValid =
    !errors.dateError &&
    !errors.absenceDateError &&
    !errors.overtimeDateError &&
    !errors.overtimeError;

  return { isValid, errors };
};

const normalizeCategory = (label: string): WorkflowCategory => {
  const mapped = REVERSE_CATEGORY[label];
  return (mapped as WorkflowCategory) || WorkflowCategory.CUSTOM;
};

const buildSubmissionCommentText = (categoryLabel: string) =>
  `${categoryLabel || "申請"}が提出されました。`;

type SubmissionCommentOptions = {
  commentText?: string;
  builderOptions?: WorkflowCommentBuilderOptions;
};

type SubmissionCommentPayloadOptions = SubmissionCommentOptions & {
  include: boolean;
  categoryLabel: string;
  existingComments?: WorkflowCommentInput[];
};

const buildSubmissionCommentsPayload = (
  options: SubmissionCommentPayloadOptions
): WorkflowCommentInput[] | undefined => {
  if (!options.include) return undefined;
  const existing = options.existingComments
    ? [...options.existingComments]
    : [];
  const text =
    options.commentText ?? buildSubmissionCommentText(options.categoryLabel);
  const systemComment = buildSystemWorkflowComment(text, {
    ...options.builderOptions,
  });
  return [...existing, systemComment];
};

type OvertimeDetailsOptions = {
  fallbackDateFactory?: () => string;
};

const buildWorkflowOvertimeDetails = (
  state: WorkflowFormState,
  options?: OvertimeDetailsOptions
): CreateWorkflowInput["overTimeDetails"] | undefined => {
  if (state.categoryLabel !== OVERTIME_LABEL) return undefined;
  const resolveDate = () =>
    state.overtimeDate ||
    (options?.fallbackDateFactory ?? defaultOvertimeDateFactory)();
  return {
    date: resolveDate(),
    startTime: state.overtimeStart,
    endTime: state.overtimeEnd,
    reason: state.overtimeReason || "",
  };
};

type BuildCreateWorkflowInputParams = {
  staffId: string;
  state: WorkflowFormState;
  draftMode: boolean;
  commentOptions?: SubmissionCommentOptions;
  overtimeDateFallbackFactory?: () => string;
};

type BuildUpdateWorkflowInputParams = {
  workflowId: string;
  state: WorkflowFormState;
  draftMode: boolean;
  commentOptions?: SubmissionCommentOptions;
  existingComments?: WorkflowCommentInput[];
};

export const buildCreateWorkflowInput = ({
  staffId,
  state,
  draftMode,
  commentOptions,
  overtimeDateFallbackFactory,
}: BuildCreateWorkflowInputParams): CreateWorkflowInput => {
  const status = draftMode ? WorkflowStatus.DRAFT : WorkflowStatus.SUBMITTED;
  const input: CreateWorkflowInput = {
    staffId,
    status,
    category: normalizeCategory(state.categoryLabel),
  };

  const overtimeDetails = buildWorkflowOvertimeDetails(state, {
    fallbackDateFactory: overtimeDateFallbackFactory,
  });
  if (overtimeDetails) input.overTimeDetails = overtimeDetails;

  const comments = buildSubmissionCommentsPayload({
    include: status === WorkflowStatus.SUBMITTED,
    categoryLabel: state.categoryLabel,
    commentText: commentOptions?.commentText,
    builderOptions: commentOptions?.builderOptions,
  });
  if (comments?.length) input.comments = comments;

  return input;
};

export const buildUpdateWorkflowInput = ({
  workflowId,
  state,
  draftMode,
  commentOptions,
  existingComments,
}: BuildUpdateWorkflowInputParams): UpdateWorkflowInput => {
  const status = draftMode ? WorkflowStatus.DRAFT : WorkflowStatus.SUBMITTED;
  const input: UpdateWorkflowInput = {
    id: workflowId,
    status,
  };

  if (state.categoryLabel) {
    input.category = normalizeCategory(state.categoryLabel);
  }

  const overtimeDetails = buildWorkflowOvertimeDetails(state);
  if (overtimeDetails) input.overTimeDetails = overtimeDetails;

  const comments = buildSubmissionCommentsPayload({
    include: status === WorkflowStatus.SUBMITTED,
    categoryLabel: state.categoryLabel,
    existingComments,
    commentText: commentOptions?.commentText,
    builderOptions: commentOptions?.builderOptions,
  });
  if (comments?.length) input.comments = comments;

  return input;
};
