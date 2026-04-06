import { createOperationLog } from "@shared/api/graphql/documents/mutations";
import {
  CreateOperationLogInput,
  CreateOperationLogMutation,
  OperationLog,
} from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/shared/api/amplify/graphqlClient";

import {
  buildOperationLogMutationError,
  OperationLogMutationError,
} from "./operationLogError";

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
  value?: string | null,
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
  key: string,
) => {
  const candidate = record?.[key];
  return typeof candidate === "string" && candidate.length > 0
    ? candidate
    : undefined;
};

const enrichOperationLogInput = (
  input: CreateOperationLogInput,
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
        (message ?? "").includes(pattern),
      ),
    ),
  );

const extractUnknownFieldNames = (errors?: readonly { message?: string }[]) => {
  const fields = new Set<string>();
  if (!errors) {
    return fields;
  }

  const patterns = [
    /input\.([A-Za-z0-9_]+)/g,
    /Field '([A-Za-z0-9_]+)' is not defined by type 'CreateOperationLogInput'/g,
    /Unknown field(?:\s+)?'([A-Za-z0-9_]+)'/g,
    /contains a field not in 'CreateOperationLogInput'[^A-Za-z0-9_]*([A-Za-z0-9_]+)/g,
    /contains field not in CreateOperationLogInput[^A-Za-z0-9_]*([A-Za-z0-9_]+)/g,
  ];

  for (const error of errors) {
    const message = error.message ?? "";
    for (const pattern of patterns) {
      for (const match of message.matchAll(pattern)) {
        const candidate = match[1];
        if (candidate) {
          fields.add(candidate);
        }
      }
    }
  }

  return fields;
};

const omitFields = (
  input: Record<string, unknown>,
  fields: Set<string>,
): Record<string, unknown> =>
  Object.fromEntries(Object.entries(input).filter(([key]) => !fields.has(key)));

const createOperationLogMutation = async (input: Record<string, unknown>) =>
  (await graphqlClient.graphql({
    query: createOperationLog as string,
    variables: { input } as unknown as { input: CreateOperationLogInput },
    authMode: "userPool",
  })) as GraphQLResult<CreateOperationLogMutation>;

const assertRequiredOperationLogInput = (input: CreateOperationLogInput) => {
  const missingFields: string[] = [];
  if (!input.staffId) {
    missingFields.push("staffId");
  }
  if (!input.resource) {
    missingFields.push("resource");
  }
  if (!input.resourceKey) {
    missingFields.push("resourceKey");
  }
  if (!input.action) {
    missingFields.push("action");
  }
  if (!input.timestamp) {
    missingFields.push("timestamp");
  }

  if (missingFields.length > 0) {
    throw new OperationLogMutationError(
      "validation",
      `OperationLog input validation failed: ${missingFields.join(", ")}`,
      missingFields,
    );
  }
};

export default async function createOperationLogData(
  input: CreateOperationLogInput,
) {
  assertRequiredOperationLogInput(input);

  let mutationInput: Record<string, unknown> = enrichOperationLogInput(input);
  let response = await createOperationLogMutation(mutationInput);

  if (response.errors && shouldRetryWithLegacyInput(response.errors)) {
    const unknownFields = extractUnknownFieldNames(response.errors);
    if (unknownFields.size > 0) {
      mutationInput = omitFields(mutationInput, unknownFields);
      response = await createOperationLogMutation(mutationInput);
    }
  }

  if (response.errors) {
    throw buildOperationLogMutationError(response.errors);
  }

  if (!response.data?.createOperationLog) {
    throw new OperationLogMutationError("unknown", "No data returned", [
      "No data returned",
    ]);
  }

  const created: OperationLog = response.data.createOperationLog;
  return created;
}
