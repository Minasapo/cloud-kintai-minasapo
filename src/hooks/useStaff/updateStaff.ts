import { GraphQLResult } from "@aws-amplify/api";
import * as mutations from "@shared/api/graphql/documents/mutations";
import {
  Staff,
  UpdateStaffInput,
  UpdateStaffMutation,
} from "@shared/api/graphql/types";
import { API } from "aws-amplify";

export default async function updateStaff(input: UpdateStaffInput) {
  console.log({ input });
  const response = (await API.graphql({
    query: mutations.updateStaff,
    variables: { input },
    authMode: "AMAZON_COGNITO_USER_POOLS",
  })) as GraphQLResult<UpdateStaffMutation>;

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  const staff = response.data?.updateStaff as Staff;
  return staff;
}
