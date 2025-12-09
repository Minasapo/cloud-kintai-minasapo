import { GraphQLResult } from "@aws-amplify/api";
import { listStaff } from "@shared/api/graphql/documents/queries";
import { ListStaffQuery, Staff } from "@shared/api/graphql/types";
import { API } from "aws-amplify";

export default async function fetchStaffs() {
  const staffs: Staff[] = [];
  const response = (await API.graphql({
    query: listStaff,
    authMode: "AMAZON_COGNITO_USER_POOLS",
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
