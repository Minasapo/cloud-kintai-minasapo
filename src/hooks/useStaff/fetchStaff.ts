import { GraphQLResult } from "@aws-amplify/api";
import { API } from "aws-amplify";

import { Staff, StaffByCognitoUserIdQuery } from "../../API";
import { staffByCognitoUserId } from "../../graphql/queries";

export default async function fetchStaff(
  cognitoUserId: Staff["cognitoUserId"]
) {
  const response = (await API.graphql({
    query: staffByCognitoUserId,
    variables: {
      cognitoUserId,
    },
    authMode: "AMAZON_COGNITO_USER_POOLS",
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
