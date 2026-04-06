import type { ModelOperationLogFilterInput } from "@shared/api/graphql/types";

import fetchOperationLogs from "@/entities/operation-log/model/fetchOperationLogs";

export default async function fetchAdminOperationLogs(
  nextToken: string | null = null,
  limit = 30,
  filter?: ModelOperationLogFilterInput | null,
) {
  return fetchOperationLogs({
    nextToken,
    limit,
    filter,
  });
}
