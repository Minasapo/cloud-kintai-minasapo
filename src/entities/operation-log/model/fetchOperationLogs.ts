import { listOperationLogs } from "@shared/api/graphql/documents/queries";
import {
  ListOperationLogsQuery,
  ModelOperationLogFilterInput,
  OperationLog,
} from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/shared/api/amplify/graphqlClient";

import {
  buildSafeResourceKeyFilter,
  extractInvalidResourceKeyItemCount,
  hasNullableResourceKeyError,
  normalizeLegacyOperationLog,
} from "./operationLogLegacyCompatibility";

export type FetchOperationLogsParams = {
  filter?: ModelOperationLogFilterInput | null;
  nextToken?: string | null;
  limit?: number;
};

export type FetchOperationLogsResult = {
  items: OperationLog[];
  nextToken: string | null;
  excludedInvalidRecords?: boolean;
  excludedInvalidRecordCount?: number;
};

const executeListOperationLogs = async ({
  filter,
  nextToken,
  limit,
}: {
  filter?: ModelOperationLogFilterInput | null;
  nextToken: string | null;
  limit: number;
}) => {
  return (await graphqlClient.graphql({
    query: listOperationLogs,
    variables: {
      filter: filter ?? undefined,
      limit,
      nextToken,
    },
    authMode: "userPool",
  })) as GraphQLResult<ListOperationLogsQuery>;
};

export default async function fetchOperationLogs({
  filter,
  nextToken = null,
  limit = 30,
}: FetchOperationLogsParams = {}): Promise<FetchOperationLogsResult> {
  let response = await executeListOperationLogs({
    filter,
    nextToken,
    limit,
  });
  let excludedInvalidRecords = false;
  let excludedInvalidRecordCount = 0;

  if (response.errors) {
    if (hasNullableResourceKeyError(response.errors)) {
      const countFromError = extractInvalidResourceKeyItemCount(
        response.errors,
      );
      excludedInvalidRecordCount = countFromError > 0 ? countFromError : 1;
      response = await executeListOperationLogs({
        filter: buildSafeResourceKeyFilter(filter),
        nextToken,
        limit,
      });
      excludedInvalidRecords = true;

      if (response.errors) {
        const fallbackFirst = response.errors[0] as { message?: unknown };
        const fallbackMessage =
          typeof fallbackFirst?.message === "string" &&
          fallbackFirst.message.trim().length > 0
            ? fallbackFirst.message
            : "ログの取得に失敗しました。";
        throw new Error(fallbackMessage);
      }
    } else {
      const first = response.errors[0] as { message?: unknown };
      const message =
        typeof first?.message === "string" && first.message.trim().length > 0
          ? first.message
          : "ログの取得に失敗しました。";
      throw new Error(message);
    }
  }

  const items: OperationLog[] = [];
  if (!response.data?.listOperationLogs) {
    return { items, nextToken: null };
  }

  items.push(
    ...response.data.listOperationLogs.items
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map(normalizeLegacyOperationLog),
  );

  return {
    items,
    nextToken: response.data.listOperationLogs.nextToken ?? null,
    excludedInvalidRecords,
    excludedInvalidRecordCount,
  };
}
