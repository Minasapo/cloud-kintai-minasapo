import type { OperationLogResourceSource } from "../types";
import { formatOperationLogInlineValue } from "../utils/formatOperationLogInlineValue";

export const getOperationLogResourceDisplay = (
  log: OperationLogResourceSource,
) => {
  const resourceKey = formatOperationLogInlineValue(log.resourceKey);
  if (resourceKey) {
    return resourceKey;
  }

  const resource = formatOperationLogInlineValue(log.resource);
  const resourceId = formatOperationLogInlineValue(log.resourceId);
  const fallback = [resource, resourceId].filter(Boolean).join(" ");

  return fallback || "(リソースなし)";
};
