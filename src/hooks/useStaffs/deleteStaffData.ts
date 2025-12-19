import { deleteStaff } from "@shared/api/graphql/documents/mutations";
import {
  DeleteStaffInput,
  DeleteStaffMutation,
  Staff,
} from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/lib/amplify/graphqlClient";

export default async function deleteStaffData(input: DeleteStaffInput) {
  const response = (await graphqlClient.graphql({
    query: deleteStaff,
    variables: { input },
    authMode: "userPool",
  })) as GraphQLResult<DeleteStaffMutation>;

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  if (!response.data?.deleteStaff) {
    throw new Error("deleteStaff failed");
  }

  const staff: Staff = response.data.deleteStaff;
  return staff;
}
