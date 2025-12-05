import type { GraphQLResult } from "@aws-amplify/api";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { API } from "aws-amplify";

type GraphQLAuthMode =
  | "API_KEY"
  | "AWS_IAM"
  | "AMAZON_COGNITO_USER_POOLS"
  | "OPENID_CONNECT"
  | "AWS_LAMBDA";

export type GraphQLBaseQueryArgs<TVariables extends object = Record<string, unknown>> = {
  document: string;
  variables?: TVariables;
  authMode?: GraphQLAuthMode;
};

export type GraphQLBaseQueryError = {
  message: string;
  details?: unknown;
};

export const graphqlBaseQuery = <
  TVariables extends object = Record<string, unknown>,
>({
  defaultAuthMode = "AMAZON_COGNITO_USER_POOLS",
}: {
  defaultAuthMode?: GraphQLAuthMode;
} = {}): BaseQueryFn<
  GraphQLBaseQueryArgs<TVariables>,
  unknown,
  GraphQLBaseQueryError
> =>
  async ({ document, variables, authMode }) => {
    try {
      const result = (await API.graphql({
        query: document,
        variables,
        authMode: authMode ?? defaultAuthMode,
      })) as GraphQLResult<unknown>;

      if (result.errors?.length) {
        return {
          error: {
            message: "GraphQL request failed",
            details: result.errors,
          },
        };
      }

      return { data: result.data ?? null };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          details: error,
        },
      };
    }
  };
