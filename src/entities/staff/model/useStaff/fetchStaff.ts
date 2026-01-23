import { staffByCognitoUserId } from "@shared/api/graphql/documents/queries";
import { Staff, StaffByCognitoUserIdQuery } from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/shared/api/amplify/graphqlClient";

export default async function fetchStaff(
  cognitoUserId: Staff["cognitoUserId"]
) {
  const response = (await graphqlClient.graphql({
    query: staffByCognitoUserId,
    variables: {
      cognitoUserId,
    },
    authMode: "userPool",
  })) as GraphQLResult<StaffByCognitoUserIdQuery>;

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  if (!response.data?.staffByCognitoUserId?.items) {
    throw new Error("スタッフが見つかりませんでした。");
  }

  const staffs = response.data.staffByCognitoUserId.items.filter(
    (item): item is NonNullable<typeof item> => item !== null
  );

  return staffs[0];
}
