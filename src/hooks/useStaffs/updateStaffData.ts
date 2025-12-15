import { updateStaff } from "@shared/api/graphql/documents/mutations";
import {
  Staff,
  UpdateStaffInput,
  UpdateStaffMutation,
} from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/lib/amplify/graphqlClient";

export default async function updateStaffData(input: UpdateStaffInput) {
  const response = (await graphqlClient.graphql({
    query: updateStaff,
    variables: { input },
    authMode: "userPool",
  })) as GraphQLResult<UpdateStaffMutation>;

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  if (!response.data?.updateStaff) {
    throw new Error("Failed to update staff");
  }

  const staff: Staff = response.data.updateStaff;
  return staff;
}
