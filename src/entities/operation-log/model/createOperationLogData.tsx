import { createOperationLog } from "@shared/api/graphql/documents/mutations";
import {
  CreateOperationLogInput,
  CreateOperationLogMutation,
  OperationLog,
} from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/shared/api/amplify/graphqlClient";

type CreateOperationLogInputWithContext = CreateOperationLogInput & {
  clientTimezone?: string | null;
  occurredAt?: string | null;
  resolvedWorkDate?: string | null;
  idempotencyKey?: string | null;
  appVersion?: string | null;
};

const CREATE_OPERATION_LOG_INPUT_UNKNOWN_FIELD_PATTERNS = [
  "contains a field not in 'CreateOperationLogInput'",
  "contains field not in CreateOperationLogInput",
  "Unknown field",
  "FieldUndefined",
  "Validation error of type UndefinedField",
];

const parseJsonRecord = (
  value?: string | null
): Record<string, unknown> | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
};

const readStringField = (
  record: Record<string, unknown> | null,
  key: string
) => {
  const candidate = record?.[key];
  return typeof candidate === "string" && candidate.length > 0
    ? candidate
    : undefined;
};

const enrichOperationLogInput = (
  input: CreateOperationLogInput
): CreateOperationLogInputWithContext => {
  const metadata = parseJsonRecord(input.metadata);
  const details = parseJsonRecord(input.details);

  const pick = (key: string) =>
    readStringField(metadata, key) ?? readStringField(details, key);

  return {
    ...input,
    clientTimezone: pick("clientTimezone"),
    occurredAt: pick("occurredAt"),
    resolvedWorkDate: pick("resolvedWorkDate"),
    idempotencyKey: pick("idempotencyKey"),
    appVersion: pick("appVersion"),
  };
};

const shouldRetryWithLegacyInput = (errors?: readonly { message?: string }[]) =>
  Boolean(
    errors?.some(({ message }) =>
      CREATE_OPERATION_LOG_INPUT_UNKNOWN_FIELD_PATTERNS.some((pattern) =>
        (message ?? "").includes(pattern)
      )
    )
  );

const createOperationLogMutation = async (
  input: Record<string, unknown>
) =>
  (await graphqlClient.graphql({
    query: createOperationLog as string,
    variables: { input } as unknown as { input: CreateOperationLogInput },
    authMode: "userPool",
  })) as GraphQLResult<CreateOperationLogMutation>;

export default async function createOperationLogData(
  input: CreateOperationLogInput
) {
  let response = await createOperationLogMutation(enrichOperationLogInput(input));

  if (response.errors && shouldRetryWithLegacyInput(response.errors)) {
    response = await createOperationLogMutation(input as Record<string, unknown>);
  }

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  if (!response.data?.createOperationLog) {
    throw new Error("No data returned");
  }

  const created: OperationLog = response.data.createOperationLog;
  return created;
}
