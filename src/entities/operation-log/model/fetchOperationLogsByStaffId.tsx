import { operationLogsByStaffId } from "@shared/api/graphql/documents/queries";
import {
  ModelAttributeTypes,
  ModelOperationLogFilterInput,
  OperationLog,
  OperationLogsByStaffIdQuery,
  OperationLogsByStaffIdQueryVariables,
} from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/shared/api/amplify/graphqlClient";

export default async function fetchOperationLogsByStaffId(
  staffId: string,
  limit = 50,
) {
  const logs: OperationLog[] = [];

  const hasNullableResourceKeyError = (
    errors?: readonly { message?: string }[],
  ) =>
    Boolean(
      errors?.some((error) =>
        (error.message ?? "").includes(
          "Cannot return null for non-nullable type: 'String' within parent 'OperationLog'",
        ),
      ),
    );

  const VALID_RESOURCE_KEY_FILTER: ModelOperationLogFilterInput = {
    resourceKey: {
      attributeExists: true,
      attributeType: ModelAttributeTypes.string,
    },
  };

  const variables: OperationLogsByStaffIdQueryVariables = {
    staffId,
    limit,
  };

  let response = (await graphqlClient.graphql({
    query: operationLogsByStaffId,
    variables,
    authMode: "userPool",
  })) as GraphQLResult<OperationLogsByStaffIdQuery>;

  if (response.errors && hasNullableResourceKeyError(response.errors)) {
    response = (await graphqlClient.graphql({
      query: operationLogsByStaffId,
      variables: {
        ...variables,
        filter: VALID_RESOURCE_KEY_FILTER,
      },
      authMode: "userPool",
    })) as GraphQLResult<OperationLogsByStaffIdQuery>;
  }

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  if (!response.data?.operationLogsByStaffId) {
    return logs;
  }

  logs.push(
    ...response.data.operationLogsByStaffId.items.filter(
      (item): item is NonNullable<typeof item> => !!item,
    ),
  );

  return logs;
}
