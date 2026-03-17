import * as mutations from "@shared/api/graphql/documents/mutations";
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

export default async function updateStaff({
  input,
  condition,
}: UpdateStaffPayload) {
  const response = (await graphqlClient.graphql({
    query: mutations.updateStaff,
    variables: {
      input,
      condition: condition ?? undefined,
    },
    authMode: "userPool",
  })) as GraphQLResult<UpdateStaffMutation>;

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  const staff = response.data?.updateStaff as Staff;
  return staff;
}
