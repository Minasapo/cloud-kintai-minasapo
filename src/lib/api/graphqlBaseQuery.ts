import type { GraphQLAuthMode } from "@aws-amplify/core/internals/utils";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/lib/amplify/graphqlClient";

export type SerializableValue =
  | string
  | number
  | boolean
  | null
  | SerializableValue[]
  | { [key: string]: SerializableValue };

export type GraphQLBaseQueryArgs<
  TVariables extends object = Record<string, unknown>
> = {
  document: string;
  variables?: TVariables;
  authMode?: GraphQLAuthMode;
};

export type GraphQLBaseQueryError = {
  message: string;
  details?: SerializableValue;
};

const serializeValue = (
  value: unknown,
  seen = new WeakSet<object>()
): SerializableValue | undefined => {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (value === null) {
    return null;
  }

  if (typeof value === "bigint") {
    const asNumber = Number(value);
    return Number.isSafeInteger(asNumber) ? asNumber : value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    if (seen.has(value)) {
      return undefined;
    }
    seen.add(value);
    const serializedArray = value
      .map((item) => serializeValue(item, seen))
      .filter((item): item is SerializableValue => typeof item !== "undefined");
    seen.delete(value);
    return serializedArray;
  }

  if (typeof value === "object" && value !== null) {
    if (seen.has(value as object)) {
      return undefined;
    }
    seen.add(value as object);
    const serializedObjectEntries = Object.entries(
      value as Record<string, unknown>
    ).reduce<Record<string, SerializableValue>>((acc, [key, nestedValue]) => {
      const serializedNested = serializeValue(nestedValue, seen);
      if (typeof serializedNested !== "undefined") {
        acc[key] = serializedNested;
      }
      return acc;
    }, {});
    seen.delete(value as object);
    return Object.keys(serializedObjectEntries).length
      ? serializedObjectEntries
      : undefined;
  }

  return undefined;
};

const serializeGraphQLErrors = (
  errors?: GraphQLResult["errors"]
): SerializableValue | undefined => {
  if (!errors || errors.length === 0) {
    return undefined;
  }

  const serializedErrors = errors
    .map((error) => {
      if (!error) {
        return undefined;
      }

      const base: Record<string, unknown> = {
        message:
          typeof error.message === "string" ? error.message : "GraphQL error",
      };

      if (Array.isArray(error.path)) {
        base.path = error.path;
      }

      if (Array.isArray(error.locations)) {
        base.locations = error.locations.map((location) => ({
          line: typeof location?.line === "number" ? location.line : undefined,
          column:
            typeof location?.column === "number" ? location.column : undefined,
        }));
      }

      const { extensions } = error as { extensions?: Record<string, unknown> };
      if (extensions && typeof extensions === "object") {
        const serializedExtensions = serializeValue(extensions);
        if (serializedExtensions) {
          base.extensions = serializedExtensions;
        }
      }

      const errorType = (error as { errorType?: string }).errorType;
      if (typeof errorType === "string") {
        base.errorType = errorType;
      }

      return serializeValue(base);
    })
    .filter((entry): entry is SerializableValue => Boolean(entry));

  return serializedErrors.length ? serializedErrors : undefined;
};

const serializeUnknownError = (error: unknown): SerializableValue => {
  if (error instanceof Error) {
    const base: Record<string, unknown> = {
      name: error.name,
      message: error.message,
    };

    if (typeof error.stack === "string") {
      base.stack = error.stack;
    }

    const code = (error as { code?: unknown }).code;
    if (
      typeof code === "string" ||
      (typeof code === "number" && Number.isFinite(code))
    ) {
      base.code = code;
    }

    const statusCode = (error as { statusCode?: unknown }).statusCode;
    if (typeof statusCode === "number") {
      base.statusCode = statusCode;
    }

    const retryable = (error as { retryable?: unknown }).retryable;
    if (typeof retryable === "boolean") {
      base.retryable = retryable;
    }

    const cause = (error as { cause?: unknown }).cause;
    const serializedCause = serializeValue(cause);
    if (serializedCause) {
      base.cause = serializedCause;
    }

    return serializeValue(base) ?? { message: error.message };
  }

  const serialized = serializeValue(error);
  if (serialized) {
    return serialized;
  }

  return { message: "Unknown error" };
};

export const graphqlBaseQuery =
  <TVariables extends object = Record<string, unknown>>({
    defaultAuthMode = "userPool",
  }: {
    defaultAuthMode?: GraphQLAuthMode;
  } = {}): BaseQueryFn<
    GraphQLBaseQueryArgs<TVariables>,
    unknown,
    GraphQLBaseQueryError
  > =>
  async ({ document, variables, authMode }) => {
    try {
      const result = (await graphqlClient.graphql({
        query: document,
        variables,
        authMode: authMode ?? defaultAuthMode,
      })) as GraphQLResult<unknown>;

      const serializedErrors = serializeGraphQLErrors(result.errors);
      if (serializedErrors) {
        return {
          error: {
            message: "GraphQL request failed",
            details: serializedErrors,
          },
        };
      }

      return { data: result.data ?? null };
    } catch (error) {
      const serializedErrorDetails = serializeUnknownError(error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Unknown error";
      return {
        error: {
          message,
          details: serializedErrorDetails,
        },
      };
    }
  };
