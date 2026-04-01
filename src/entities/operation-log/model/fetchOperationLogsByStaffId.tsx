import { operationLogsByStaffId } from "@shared/api/graphql/documents/queries";
import {
  ModelOperationLogFilterInput,
  OperationLog,
  OperationLogsByStaffIdQuery,
  OperationLogsByStaffIdQueryVariables,
} from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/shared/api/amplify/graphqlClient";

import {
  buildSafeResourceKeyFilter,
  hasNullableResourceKeyError,
  normalizeLegacyOperationLog,
} from "./operationLogLegacyCompatibility";

export default async function fetchOperationLogsByStaffId(
  staffId: string,
  limit = 50,
) {
  const logs: OperationLog[] = [];

  const variables: OperationLogsByStaffIdQueryVariables = {
    staffId,
    limit,
  };

  const executeQuery = async (
    vars: OperationLogsByStaffIdQueryVariables,
  ): Promise<GraphQLResult<OperationLogsByStaffIdQuery>> => {
    try {
      return (await graphqlClient.graphql({
        query: operationLogsByStaffId,
        variables: vars,
        authMode: "userPool",
      })) as GraphQLResult<OperationLogsByStaffIdQuery>;
    } catch (thrown: unknown) {
      if (thrown !== null && typeof thrown === "object" && "errors" in thrown) {
        return thrown as GraphQLResult<OperationLogsByStaffIdQuery>;
      }
      throw thrown;
    }
  };

  let response = await executeQuery(variables);

  if (response.errors && hasNullableResourceKeyError(response.errors)) {
    response = await executeQuery({
      ...variables,
      filter: buildSafeResourceKeyFilter(null) as ModelOperationLogFilterInput,
    });
  }

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  if (!response.data?.operationLogsByStaffId) {
    return logs;
  }

  logs.push(
    ...response.data.operationLogsByStaffId.items
      .filter((item): item is NonNullable<typeof item> => !!item)
      .map(normalizeLegacyOperationLog),
  );

  return logs;
}
