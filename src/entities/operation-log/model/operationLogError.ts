type GraphQLErrorLike = {
  message?: string | null;
};

export type OperationLogErrorKind =
  | "validation"
  | "authorization"
  | "network"
  | "unknown";

const AUTHORIZATION_PATTERNS = [
  "not authorized",
  "unauthorized",
  "forbidden",
  "access denied",
  "permission denied",
];

const NETWORK_PATTERNS = [
  "networkerror",
  "failed to fetch",
  "timeout",
  "econn",
  "enotfound",
  "request failed",
];

const VALIDATION_PATTERNS = [
  "validation error",
  "fieldundefined",
  "unknown field",
  "not defined by type",
  "contains a field not in",
  "contains field not in",
  "cannot return null for non-nullable",
  "invalid value",
  "input",
];

const normalizeMessages = (messages: string[]) =>
  messages
    .map((message) => message.trim())
    .filter((message) => message.length > 0);

const hasPattern = (messages: string[], patterns: string[]) => {
  const lowerMessages = messages.map((message) => message.toLowerCase());
  return patterns.some((pattern) =>
    lowerMessages.some((message) => message.includes(pattern)),
  );
};

export const classifyOperationLogErrorKind = (
  messages: string[],
): OperationLogErrorKind => {
  if (messages.length === 0) {
    return "unknown";
  }

  if (hasPattern(messages, AUTHORIZATION_PATTERNS)) {
    return "authorization";
  }

  if (hasPattern(messages, NETWORK_PATTERNS)) {
    return "network";
  }

  if (hasPattern(messages, VALIDATION_PATTERNS)) {
    return "validation";
  }

  return "unknown";
};

export class OperationLogMutationError extends Error {
  readonly kind: OperationLogErrorKind;
  readonly messages: string[];

  constructor(
    kind: OperationLogErrorKind,
    message: string,
    messages: string[],
  ) {
    super(message);
    this.name = "OperationLogMutationError";
    this.kind = kind;
    this.messages = messages;
  }
}

export const buildOperationLogMutationError = (
  errors?: readonly GraphQLErrorLike[],
  fallbackMessage = "操作ログの保存に失敗しました。",
) => {
  const messages = normalizeMessages(
    (errors ?? []).flatMap((error) =>
      typeof error.message === "string" ? [error.message] : [],
    ),
  );

  const message = messages[0] ?? fallbackMessage;
  return new OperationLogMutationError(
    classifyOperationLogErrorKind(messages),
    message,
    messages,
  );
};
