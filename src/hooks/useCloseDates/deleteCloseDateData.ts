import { deleteCloseDate } from "@shared/api/graphql/documents/mutations";
import {
  CloseDate,
  DeleteCloseDateInput,
  DeleteCloseDateMutation,
} from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/lib/amplify/graphqlClient";

export default async function deleteCloseDateData(input: DeleteCloseDateInput) {
  const response = (await graphqlClient.graphql({
    query: deleteCloseDate,
    variables: { input },
    authMode: "userPool",
  })) as GraphQLResult<DeleteCloseDateMutation>;

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  if (!response.data?.deleteCloseDate) {
    throw new Error("No data returned");
  }

  const closeDate: CloseDate = response.data.deleteCloseDate;
  return closeDate;
}
