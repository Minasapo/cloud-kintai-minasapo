import { listCloseDates } from "@shared/api/graphql/documents/queries";
import { CloseDate, ListCloseDatesQuery } from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/lib/amplify/graphqlClient";

export default async function fetchCloseDates() {
  const closeDates: CloseDate[] = [];
  let nextToken: string | null = null;
  const isLooping = true;
  while (isLooping) {
    const response = (await graphqlClient.graphql({
      query: listCloseDates,
      authMode: "userPool",
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
