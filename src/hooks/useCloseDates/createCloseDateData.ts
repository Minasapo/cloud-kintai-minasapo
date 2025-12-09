import { GraphQLResult } from "@aws-amplify/api";
import { createCloseDate } from "@shared/api/graphql/documents/mutations";
import { API } from "aws-amplify";

import {
  CloseDate,
  CreateCloseDateInput,
  CreateCloseDateMutation,
} from "../../API";

export default async function createCloseDateData(input: CreateCloseDateInput) {
  const response = (await API.graphql({
    query: createCloseDate,
    variables: { input },
    authMode: "AMAZON_COGNITO_USER_POOLS",
  })) as GraphQLResult<CreateCloseDateMutation>;

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  if (!response.data?.createCloseDate) {
    throw new Error("No data returned");
  }

  const closeDate: CloseDate = response.data.createCloseDate;
  return closeDate;
}
