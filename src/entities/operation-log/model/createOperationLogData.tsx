import { createOperationLog } from "@shared/api/graphql/documents/mutations";
import {
  CreateOperationLogInput,
  CreateOperationLogMutation,
  OperationLog,
} from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/shared/api/amplify/graphqlClient";

export default async function createOperationLogData(
  input: CreateOperationLogInput
) {
  const response = (await graphqlClient.graphql({
    query: createOperationLog,
    variables: { input },
    authMode: "userPool",
  })) as GraphQLResult<CreateOperationLogMutation>;

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  if (!response.data?.createOperationLog) {
    throw new Error("No data returned");
  }

  const created: OperationLog = response.data.createOperationLog;
  return created;
}
