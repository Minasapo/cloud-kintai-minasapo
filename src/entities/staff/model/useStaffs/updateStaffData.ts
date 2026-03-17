import { updateStaff } from "@shared/api/graphql/documents/mutations";
import {
  ModelStaffConditionInput,
  Staff,
  UpdateStaffInput,
  UpdateStaffMutation,
} from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/shared/api/amplify/graphqlClient";

export type UpdateStaffPayload = {
  input: UpdateStaffInput;
  condition?: ModelStaffConditionInput | null;
};

export default async function updateStaffData({
  input,
  condition,
}: UpdateStaffPayload) {
  const response = (await graphqlClient.graphql({
    query: updateStaff,
    variables: {
      input,
      condition: condition ?? undefined,
    },
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
