import { getOperationLogLabel } from "../../operationLogLabels";
import type { OperationLogDisplaySource } from "../types";
import { formatOperationLogInlineValue } from "../utils/formatOperationLogInlineValue";
import { getDetailsSummary } from "./getDetailsSummary";

export const getOperationLogDisplaySummary = (
  log: OperationLogDisplaySource,
) => {
  const summary = formatOperationLogInlineValue(log.summary);
  if (summary) {
    return summary;
  }

  const detailsSummary = formatOperationLogInlineValue(
    getDetailsSummary(log.details),
  );
  if (detailsSummary) {
    return detailsSummary;
  }

  return getOperationLogLabel(log.action);
};
