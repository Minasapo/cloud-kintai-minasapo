import type { GraphQLResult } from "aws-amplify/api";

const CONDITIONAL_CHECK_FAILED_MESSAGES = [
  "ConditionalCheckFailed",
  "The conditional request failed",
];

export const buildUpdatedAtCondition = (updatedAt?: string | null) =>
  updatedAt ? { updatedAt: { eq: updatedAt } } : undefined;

export const buildRevisionCondition = (revision?: number | null) =>
  typeof revision === "number" ? { revision: { eq: revision } } : undefined;

export const buildVersionCondition = (version?: number | null) =>
  typeof version === "number" ? { version: { eq: version } } : undefined;

export const getNextVersion = (version?: number | null) =>
  (typeof version === "number" ? version : 0) + 1;

export const buildVersionOrUpdatedAtCondition = (
  version?: number | null,
  updatedAt?: string | null,
) => buildVersionCondition(version) ?? buildUpdatedAtCondition(updatedAt);

export const isConditionalCheckFailed = (message: string) =>
  CONDITIONAL_CHECK_FAILED_MESSAGES.some((pattern) =>
    message.includes(pattern),
  );

export const getGraphQLErrorMessage = (
  errors: GraphQLResult<unknown>["errors"],
  fallbackMessage: string,
  conflictMessage = "他の更新が先に反映されました。画面を再読み込みしてから再度お試しください。",
) => {
  const message = errors?.map((error) => error.message).join("\n");

  if (!message) {
    return fallbackMessage;
  }

  return isConditionalCheckFailed(message) ? conflictMessage : message;
};
