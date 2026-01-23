import { listStaff } from "@shared/api/graphql/documents/queries";
import { ListStaffQuery, Staff } from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/lib/amplify/graphqlClient";

export default async function fetchStaffs() {
  const staffs: Staff[] = [];
  const response = (await graphqlClient.graphql({
    query: listStaff,
    authMode: "userPool",
  })) as GraphQLResult<ListStaffQuery>;

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  if (!response.data?.listStaff) {
    throw new Error("No data returned");
  }

  staffs.push(
    ...response.data.listStaff.items.filter(
      (item): item is NonNullable<typeof item> => !!item
    )
  );

  return staffs;
}
