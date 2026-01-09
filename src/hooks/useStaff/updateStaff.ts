import * as mutations from "@shared/api/graphql/documents/mutations";
import {
  Staff,
  UpdateStaffInput,
  UpdateStaffMutation,
} from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/lib/amplify/graphqlClient";

export default async function updateStaff(input: UpdateStaffInput) {
  const response = (await graphqlClient.graphql({
    query: mutations.updateStaff,
    variables: { input },
    authMode: "userPool",
  })) as GraphQLResult<UpdateStaffMutation>;

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  const staff = response.data?.updateStaff as Staff;
  return staff;
}
