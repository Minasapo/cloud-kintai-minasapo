import { listOperationLogs } from "@shared/api/graphql/documents/queries";
import {
  ListOperationLogsQuery,
  ModelOperationLogFilterInput,
  OperationLog,
} from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/shared/api/amplify/graphqlClient";

export type FetchOperationLogsParams = {
  filter?: ModelOperationLogFilterInput | null;
  nextToken?: string | null;
  limit?: number;
};

export default async function fetchOperationLogs({
  filter,
  nextToken = null,
  limit = 30,
}: FetchOperationLogsParams = {}) {
  const response = (await graphqlClient.graphql({
    query: listOperationLogs,
    variables: {
      filter: filter ?? undefined,
      limit,
      nextToken,
    },
    authMode: "userPool",
  })) as GraphQLResult<ListOperationLogsQuery>;

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  const items: OperationLog[] = [];
  if (!response.data?.listOperationLogs) {
    return { items, nextToken: null };
  }

  items.push(
    ...response.data.listOperationLogs.items.filter(
      (item): item is NonNullable<typeof item> => Boolean(item),
    ),
  );

  return {
    items,
    nextToken: response.data.listOperationLogs.nextToken ?? null,
  };
}
