import { GraphQLResult } from "@aws-amplify/api";
import { staffByCognitoUserId } from "@shared/api/graphql/documents/queries";
import { Staff, StaffByCognitoUserIdQuery } from "@shared/api/graphql/types";
import { API } from "aws-amplify";

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
