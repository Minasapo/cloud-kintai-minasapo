import { GraphQLResult } from "@aws-amplify/api";
import { API } from "aws-amplify";

import {
  CreateOperationLogInput,
  CreateOperationLogMutation,
  OperationLog,
} from "../../API";
import { createOperationLog } from "../../graphql/mutations";

export default async function createOperationLogData(
  input: CreateOperationLogInput
) {
  const response = (await API.graphql({
    query: createOperationLog,
    variables: { input },
    authMode: "AMAZON_COGNITO_USER_POOLS",
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
