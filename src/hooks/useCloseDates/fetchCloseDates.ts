import { GraphQLResult } from "@aws-amplify/api";
import { listCloseDates } from "@shared/api/graphql/documents/queries";
import { CloseDate, ListCloseDatesQuery } from "@shared/api/graphql/types";
import { API } from "aws-amplify";

export default async function fetchCloseDates() {
  const closeDates: CloseDate[] = [];
  let nextToken: string | null = null;
  const isLooping = true;
  while (isLooping) {
    const response = (await API.graphql({
      query: listCloseDates,
      authMode: "AMAZON_COGNITO_USER_POOLS",
      variables: { nextToken },
    })) as GraphQLResult<ListCloseDatesQuery>;

    if (response.errors) {
      throw new Error(response.errors[0].message);
    }

    if (!response.data?.listCloseDates) {
      throw new Error("No data returned");
    }

    closeDates.push(
      ...response.data.listCloseDates.items.filter(
        (item): item is NonNullable<typeof item> => item !== null
      )
    );

    if (response.data.listCloseDates.nextToken) {
      nextToken = response.data.listCloseDates.nextToken;
      continue;
    }

    break;
  }

  return closeDates;
}
