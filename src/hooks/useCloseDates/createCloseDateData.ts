import { createCloseDate } from "@shared/api/graphql/documents/mutations";
import {
  CloseDate,
  CreateCloseDateInput,
  CreateCloseDateMutation,
} from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/lib/amplify/graphqlClient";

export default async function createCloseDateData(input: CreateCloseDateInput) {
  const response = (await graphqlClient.graphql({
    query: createCloseDate,
    variables: { input },
    authMode: "userPool",
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
