import { ShiftRequestStatus } from "@shared/api/graphql/types";

export type ShiftRequestDayStatus =
  | "work"
  | "fixedOff"
  | "requestedOff"
  | "auto";

export type SelectedDateMap = Record<string, { status: ShiftRequestDayStatus }>;

export const statusToShiftRequestStatus: Record<
  ShiftRequestDayStatus,
  ShiftRequestStatus
> = {
  work: ShiftRequestStatus.WORK,
  fixedOff: ShiftRequestStatus.FIXED_OFF,
  requestedOff: ShiftRequestStatus.REQUESTED_OFF,
  auto: ShiftRequestStatus.AUTO,
};

export const shiftRequestStatusToStatus = (
  status?: ShiftRequestStatus | null
): ShiftRequestDayStatus => {
  switch (status) {
    case ShiftRequestStatus.WORK:
      return "work";
    case ShiftRequestStatus.FIXED_OFF:
      return "fixedOff";
    case ShiftRequestStatus.REQUESTED_OFF:
      return "requestedOff";
    default:
      return "auto";
  }
};

export const normalizeStatus = (value?: string): ShiftRequestDayStatus => {
  if (
    value === "work" ||
    value === "fixedOff" ||
    value === "requestedOff" ||
    value === "auto"
  ) {
    return value;
  }
  if (value === "off") return "fixedOff";
  return "auto";
};
