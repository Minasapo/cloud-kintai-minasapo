import { updateCloseDate } from "@shared/api/graphql/documents/mutations";
import {
  CloseDate,
  UpdateCloseDateInput,
  UpdateCloseDateMutation,
} from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/lib/amplify/graphqlClient";

export default async function updateCloseDateData(input: UpdateCloseDateInput) {
  const response = (await graphqlClient.graphql({
    query: updateCloseDate,
    variables: { input },
    authMode: "userPool",
  })) as GraphQLResult<UpdateCloseDateMutation>;

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  if (!response.data?.updateCloseDate) {
    throw new Error("No data returned");
  }

  const closeDate: CloseDate = response.data.updateCloseDate;
  return closeDate;
}
