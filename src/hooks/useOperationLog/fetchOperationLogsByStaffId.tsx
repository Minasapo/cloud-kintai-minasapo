import { GraphQLResult } from "@aws-amplify/api";
import { operationLogsByStaffId } from "@shared/api/graphql/documents/queries";
import {
  OperationLog,
  OperationLogsByStaffIdQuery,
  OperationLogsByStaffIdQueryVariables,
} from "@shared/api/graphql/types";
import { API } from "aws-amplify";

export default async function fetchOperationLogsByStaffId(
  staffId: string,
  limit = 50
) {
  const logs: OperationLog[] = [];

  const variables: OperationLogsByStaffIdQueryVariables = {
    staffId,
    limit,
  };

  const response = (await API.graphql({
    query: operationLogsByStaffId,
    variables,
    authMode: "AMAZON_COGNITO_USER_POOLS",
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
