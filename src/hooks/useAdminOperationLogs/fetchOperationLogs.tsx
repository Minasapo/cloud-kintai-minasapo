import { GraphQLResult } from "@aws-amplify/api";
import { listOperationLogs } from "@shared/api/graphql/documents/queries";
import {
  ListOperationLogsQuery,
  OperationLog,
} from "@shared/api/graphql/types";
import { API } from "aws-amplify";

export default async function fetchOperationLogs(
  nextToken: string | null = null,
  limit = 30
) {
  const response = (await API.graphql({
    query: listOperationLogs,
    variables: { limit, nextToken },
    authMode: "AMAZON_COGNITO_USER_POOLS",
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
      (item): item is NonNullable<typeof item> => !!item
    )
  );

  return {
    items,
    nextToken: response.data.listOperationLogs.nextToken ?? null,
  };
}
