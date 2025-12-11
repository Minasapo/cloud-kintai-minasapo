import { ShiftRequestSummaryInput } from "@shared/api/graphql/types";

import { ShiftState } from "./generateMockShifts";

export const buildSummaryFromAssignments = (
  assignments: Record<string, ShiftState>
): ShiftRequestSummaryInput => {
  const values = Object.values(assignments);
  const count = (target: ShiftState) =>
    values.filter((state) => state === target).length;
  return {
    workDays: count("work"),
    fixedOffDays: count("fixedOff"),
    requestedOffDays: count("requestedOff"),
  };
};
