import { formatOperationLogInlineValue } from "@/entities/operation-log/lib/operationLogDisplay";
import type { Staff } from "@/shared/api/graphql/types";

import { isNonEmptyString } from "./isNonEmptyString";

export function staffLabel(
  prefix: string,
  id: unknown,
  staffMap: Record<string, Staff | null>,
) {
  const idText = formatOperationLogInlineValue(id);
  if (!idText) return `${prefix}: -`;
  if (!isNonEmptyString(id)) return `${prefix}: ${idText}`;
  if (!(id in staffMap)) return `${prefix}: ${idText}`;
  const entry = staffMap[id];
  if (!entry) return `${prefix}: ${idText}`;
  return `${prefix}: ${`${entry.familyName ?? ""} ${entry.givenName ?? ""}`.trim()}`;
}
