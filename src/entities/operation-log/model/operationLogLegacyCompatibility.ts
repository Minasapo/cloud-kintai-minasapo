import {
  ModelAttributeTypes,
  ModelOperationLogFilterInput,
  OperationLog,
} from "@shared/api/graphql/types";

type GraphQLErrorLike = {
  message?: string | null;
};

const NULLABLE_RESOURCE_KEY_ERROR_PATTERN =
  "Cannot return null for non-nullable type: 'String' within parent 'OperationLog'";

export const hasNullableResourceKeyError = (
  errors?: readonly GraphQLErrorLike[],
) =>
  Boolean(
    errors?.some((error) =>
      (error.message ?? "").includes(NULLABLE_RESOURCE_KEY_ERROR_PATTERN),
    ),
  );

export const extractInvalidResourceKeyItemCount = (
  errors?: readonly GraphQLErrorLike[],
) => {
  if (!errors) {
    return 0;
  }

  const indices = new Set<number>();
  const pattern = /\/listOperationLogs\/items\[(\d+)\]\/resourceKey/;

  for (const error of errors) {
    const message = error.message ?? "";
    const match = message.match(pattern);
    if (match && match[1]) {
      indices.add(Number(match[1]));
    }
  }

  return indices.size;
};

const VALID_RESOURCE_KEY_FILTER: ModelOperationLogFilterInput = {
  resourceKey: {
    attributeExists: true,
    attributeType: ModelAttributeTypes.string,
  },
};

export const buildSafeResourceKeyFilter = (
  filter?: ModelOperationLogFilterInput | null,
) => {
  if (!filter) {
    return VALID_RESOURCE_KEY_FILTER;
  }

  return {
    and: [filter, VALID_RESOURCE_KEY_FILTER],
  } as ModelOperationLogFilterInput;
};

const stringifyIfNeeded = (value: unknown) => {
  if (value === null || value === undefined) {
    return value as null | undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return undefined;
  }
};

const resolveLegacyResourceKey = (log: OperationLog) => {
  if (typeof log.resourceKey === "string" && log.resourceKey.length > 0) {
    return log.resourceKey;
  }

  const resource = typeof log.resource === "string" ? log.resource : "legacy";
  const resourceId =
    typeof log.resourceId === "string" && log.resourceId.length > 0
      ? log.resourceId
      : log.id;
  return `${resource}#${resourceId}`;
};

export const normalizeLegacyOperationLog = (
  log: OperationLog,
): OperationLog => ({
  ...log,
  resourceKey: resolveLegacyResourceKey(log),
  details: stringifyIfNeeded(log.details),
  metadata: stringifyIfNeeded(log.metadata),
});

export const parseOperationLogJsonLike = (value: unknown): unknown | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  return value;
};
