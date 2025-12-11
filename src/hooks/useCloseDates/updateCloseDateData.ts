import { GraphQLResult } from "@aws-amplify/api";
import { updateCloseDate } from "@shared/api/graphql/documents/mutations";
import {
  CloseDate,
  UpdateCloseDateInput,
  UpdateCloseDateMutation,
} from "@shared/api/graphql/types";
import { API } from "aws-amplify";

export default async function updateCloseDateData(input: UpdateCloseDateInput) {
  const response = (await API.graphql({
    query: updateCloseDate,
    variables: { input },
    authMode: "AMAZON_COGNITO_USER_POOLS",
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
