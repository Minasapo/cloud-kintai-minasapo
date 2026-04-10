/**
 * YAML ベースのワークフロー種別設定を使った動的バリデーション・ペイロードビルダー。
 * workflowFormModel.ts の後継実装。
 */
import {
  REVERSE_CATEGORY,
} from "@entities/workflow/lib/workflowLabels";
import {
  buildSystemWorkflowComment,
  type WorkflowCommentBuilderOptions,
} from "@features/workflow/comment-thread/model/workflowCommentBuilder";
import {
  WORKFLOW_PAYLOAD_CONSTANTS,
  type WorkflowFieldConfig,
  type WorkflowPayloadConfig,
} from "@features/workflow/config/workflowTypeConfig";
import {
  findWorkflowConfigByLabel,
} from "@features/workflow/config/workflowTypeLoader";
import {
  type CreateWorkflowInput,
  type UpdateWorkflowInput,
  WorkflowCategory,
  type WorkflowCommentInput,
  WorkflowStatus,
} from "@shared/api/graphql/types";
import { validationMessages } from "@shared/config/validationMessages";
import { formatISOToTime } from "@shared/lib/time";

// ---------------------------------------------------------------------------
// 型
// ---------------------------------------------------------------------------

export type DynamicWorkflowFormState = {
  categoryLabel: string;
  fields: Record<string, unknown>;
};

export type DynamicFormValidationResult = {
  isValid: boolean;
  /** key = fieldConfig.key */
  fieldErrors: Record<string, string>;
};

// ---------------------------------------------------------------------------
// バリデーション
// ---------------------------------------------------------------------------

const getRequiredMessage = (fieldConfig: WorkflowFieldConfig): string => {
  switch (fieldConfig.type) {
    case "date":
      return `${fieldConfig.label}を入力してください。`;
    case "date_range":
      return validationMessages.workflow.paidLeave.dateRequired;
    case "time":
      return `${fieldConfig.label}を入力してください。`;
    case "time_range":
      return validationMessages.workflow.overtime.timeRequired;
    case "text":
    case "textarea":
      return `${fieldConfig.label}を入力してください。`;
    default:
      return "入力してください。";
  }
};

const validateField = (
  fieldConfig: WorkflowFieldConfig,
  value: unknown,
): string => {
  // 必須チェック
  if (fieldConfig.required) {
    if (fieldConfig.type === "date" || fieldConfig.type === "text" || fieldConfig.type === "textarea") {
      if (!value || !(value as string).trim()) {
        return getRequiredMessage(fieldConfig);
      }
    } else if (fieldConfig.type === "date_range") {
      const v = value as { start?: string; end?: string } | undefined;
      if (!v?.start || !v?.end) {
        return getRequiredMessage(fieldConfig);
      }
    } else if (fieldConfig.type === "time") {
      if (!value) {
        return getRequiredMessage(fieldConfig);
      }
    } else if (fieldConfig.type === "time_range") {
      const v = value as { start?: string | null; end?: string | null } | undefined;
      if (!v?.start || !v?.end) {
        return getRequiredMessage(fieldConfig);
      }
    }
  }

  // 範囲チェック（startBeforeEnd）
  if (fieldConfig.validation?.startBeforeEnd) {
    if (fieldConfig.type === "date_range") {
      const v = value as { start?: string; end?: string } | undefined;
      if (v?.start && v?.end && v.start > v.end) {
        return validationMessages.workflow.paidLeave.dateRange;
      }
    } else if (fieldConfig.type === "time_range") {
      const v = value as { start?: string | null; end?: string | null } | undefined;
      if (v?.start && v?.end && v.start >= v.end) {
        return validationMessages.workflow.overtime.timeRange;
      }
    }
  }

  return "";
};

export const validateDynamicWorkflowForm = (
  state: DynamicWorkflowFormState,
): DynamicFormValidationResult => {
  const typeConfig = findWorkflowConfigByLabel(state.categoryLabel);
  if (!typeConfig) {
    return { isValid: false, fieldErrors: {} };
  }

  const fieldErrors: Record<string, string> = {};
  for (const fieldConfig of typeConfig.fields ?? []) {
    const error = validateField(fieldConfig, state.fields[fieldConfig.key]);
    if (error) {
      fieldErrors[fieldConfig.key] = error;
    }
  }

  return {
    isValid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  };
};

// ---------------------------------------------------------------------------
// ペイロードマッピング解決
// ---------------------------------------------------------------------------

/**
 * マッピング式を解決して文字列を返す。
 * - `fields.key` → フィールド値
 * - `fields.key.nested` → ネストされたフィールド値（time_range.start 等）
 * - `const.CONSTANT_KEY` → WORKFLOW_PAYLOAD_CONSTANTS[CONSTANT_KEY]
 * - その他 → そのまま返す
 *
 * time / time_range の値は ISO 8601 形式で保持しているため、HH:mm に変換する。
 */
const resolvePayloadExpr = (
  expr: string,
  fields: Record<string, unknown>,
  fieldConfigs: WorkflowFieldConfig[],
): string => {
  if (expr.startsWith("const.")) {
    return WORKFLOW_PAYLOAD_CONSTANTS[expr.slice("const.".length)] ?? "";
  }

  if (expr.startsWith("fields.")) {
    const path = expr.slice("fields.".length);
    const parts = path.split(".");
    const topKey = parts[0];
    const fieldConfig = fieldConfigs.find((f) => f.key === topKey);

    // ネストされた値を辿る
    let value: unknown = fields;
    for (const part of parts) {
      if (typeof value !== "object" || value === null) return "";
      value = (value as Record<string, unknown>)[part];
    }

    if (value === null || value === undefined) return "";

    // ISO 8601 の時刻値は HH:mm に変換
    const isTimeField =
      fieldConfig?.type === "time" ||
      (fieldConfig?.type === "time_range" && parts.length > 1);
    if (isTimeField && typeof value === "string" && value) {
      return formatISOToTime(value);
    }

    return typeof value === "string" ? value : String(value);
  }

  return expr;
};

const buildOverTimeDetailsFromPayload = (
  payloadConfig: WorkflowPayloadConfig,
  fields: Record<string, unknown>,
  fieldConfigs: WorkflowFieldConfig[],
): NonNullable<CreateWorkflowInput["overTimeDetails"]> => {
  const m = payloadConfig.mapping;
  return {
    date: resolvePayloadExpr(m.date, fields, fieldConfigs),
    startTime: resolvePayloadExpr(m.startTime, fields, fieldConfigs),
    endTime: resolvePayloadExpr(m.endTime, fields, fieldConfigs),
    reason: resolvePayloadExpr(m.reason, fields, fieldConfigs),
  };
};

// ---------------------------------------------------------------------------
// カテゴリ正規化
// ---------------------------------------------------------------------------

const normalizeCategory = (label: string): WorkflowCategory => {
  const mapped = REVERSE_CATEGORY[label];
  return (mapped as WorkflowCategory) || WorkflowCategory.CUSTOM;
};

// ---------------------------------------------------------------------------
// サブミットコメント
// ---------------------------------------------------------------------------

type SubmissionCommentOptions = {
  commentText?: string;
  builderOptions?: WorkflowCommentBuilderOptions;
};

const buildSubmissionComment = (
  categoryLabel: string,
  options?: SubmissionCommentOptions,
): WorkflowCommentInput => {
  const text =
    options?.commentText ?? `${categoryLabel || "申請"}が提出されました。`;
  return buildSystemWorkflowComment(text, options?.builderOptions);
};

// ---------------------------------------------------------------------------
// Create input builder
// ---------------------------------------------------------------------------

type BuildDynamicCreateParams = {
  staffId: string;
  state: DynamicWorkflowFormState;
  draftMode: boolean;
  commentOptions?: SubmissionCommentOptions;
};

export const buildDynamicCreateWorkflowInput = ({
  staffId,
  state,
  draftMode,
  commentOptions,
}: BuildDynamicCreateParams): CreateWorkflowInput => {
  const { categoryLabel, fields } = state;
  const status = draftMode ? WorkflowStatus.DRAFT : WorkflowStatus.SUBMITTED;
  const normalizedCategory = normalizeCategory(categoryLabel);

  const input: CreateWorkflowInput = {
    staffId,
    status,
    category: normalizedCategory,
  };

  const typeConfig = findWorkflowConfigByLabel(categoryLabel);
  if (typeConfig?.payload) {
    const fieldConfigs = typeConfig.fields ?? [];
    if (typeConfig.payload.type === "overTimeDetails") {
      input.overTimeDetails = buildOverTimeDetailsFromPayload(
        typeConfig.payload,
        fields,
        fieldConfigs,
      );
    } else if (typeConfig.payload.type === "custom") {
      const m = typeConfig.payload.mapping;
      for (const [k, expr] of Object.entries(m)) {
        (input as Record<string, unknown>)[k] = resolvePayloadExpr(
          expr,
          fields,
          fieldConfigs,
        );
      }
    }
  }

  if (status === WorkflowStatus.SUBMITTED) {
    const comment = buildSubmissionComment(categoryLabel, commentOptions);
    input.comments = [comment];
  }

  return input;
};

// ---------------------------------------------------------------------------
// Update input builder
// ---------------------------------------------------------------------------

type BuildDynamicUpdateParams = {
  workflowId: string;
  state: DynamicWorkflowFormState;
  draftMode: boolean;
  commentOptions?: SubmissionCommentOptions;
  existingComments?: WorkflowCommentInput[];
};

export const buildDynamicUpdateWorkflowInput = ({
  workflowId,
  state,
  draftMode,
  commentOptions,
  existingComments,
}: BuildDynamicUpdateParams): UpdateWorkflowInput => {
  const { categoryLabel, fields } = state;
  const status = draftMode ? WorkflowStatus.DRAFT : WorkflowStatus.SUBMITTED;
  const normalizedCategory = normalizeCategory(categoryLabel);

  const input: UpdateWorkflowInput = {
    id: workflowId,
    status,
    category: normalizedCategory,
  };

  const typeConfig = findWorkflowConfigByLabel(categoryLabel);
  if (typeConfig?.payload) {
    const fieldConfigs = typeConfig.fields ?? [];
    if (typeConfig.payload.type === "overTimeDetails") {
      input.overTimeDetails = buildOverTimeDetailsFromPayload(
        typeConfig.payload,
        fields,
        fieldConfigs,
      );
    } else if (typeConfig.payload.type === "custom") {
      const m = typeConfig.payload.mapping;
      for (const [k, expr] of Object.entries(m)) {
        (input as Record<string, unknown>)[k] = resolvePayloadExpr(
          expr,
          fields,
          fieldConfigs,
        );
      }
    }
  }

  if (status === WorkflowStatus.SUBMITTED) {
    const existing = existingComments ? [...existingComments] : [];
    const comment = buildSubmissionComment(categoryLabel, commentOptions);
    input.comments = [...existing, comment];
  }

  return input;
};
