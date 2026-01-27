import { operationLogsByStaffId } from "@shared/api/graphql/documents/queries";
import {
  OperationLog,
  OperationLogsByStaffIdQuery,
  OperationLogsByStaffIdQueryVariables,
} from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/shared/api/amplify/graphqlClient";

export default async function fetchOperationLogsByStaffId(
  staffId: string,
  limit = 50
) {
  const logs: OperationLog[] = [];

  const variables: OperationLogsByStaffIdQueryVariables = {
    staffId,
    limit,
  };

  const response = (await graphqlClient.graphql({
    query: operationLogsByStaffId,
    variables,
    authMode: "userPool",
  })) as GraphQLResult<OperationLogsByStaffIdQuery>;

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  if (!response.data?.operationLogsByStaffId) {
    return logs;
  }

  logs.push(
    ...response.data.operationLogsByStaffId.items.filter(
      (item): item is NonNullable<typeof item> => !!item
    )
  );

  return logs;
}
