import type { OperationLog } from "@shared/api/graphql/types";

export type OperationLogDisplaySource = Pick<
  OperationLog,
  "action" | "details"
> & {
  summary?: unknown;
};

export type OperationLogResourceSource = {
  resource?: unknown;
  resourceId?: unknown;
  resourceKey?: unknown;
};
