import { createStaff } from "@shared/api/graphql/documents/mutations";
import {
  CreateStaffInput,
  CreateStaffMutation,
  Staff,
} from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/lib/amplify/graphqlClient";

export default async function createStaffData(input: CreateStaffInput) {
  const response = (await graphqlClient.graphql({
    query: createStaff,
    variables: { input },
    authMode: "userPool",
  })) as GraphQLResult<CreateStaffMutation>;

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  if (!response.data?.createStaff) {
    throw new Error("Failed to create staff");
  }

  const staff: Staff = response.data.createStaff;
  return staff;
}
