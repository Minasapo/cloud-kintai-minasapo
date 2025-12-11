import { ShiftRequestStatus } from "@shared/api/graphql/types";

import { ShiftState } from "./generateMockShifts";

export type ShiftStateVisual = { label: string; color: string };

export const SHIFT_MANUAL_CHANGE_REASON = "shift-management/manual-edit";

export const shiftRequestStatusToShiftState = (
  status?: ShiftRequestStatus | null
): ShiftState => {
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

export const shiftStateToShiftRequestStatus = (
  state: ShiftState
): ShiftRequestStatus => {
  switch (state) {
    case "work":
      return ShiftRequestStatus.WORK;
    case "fixedOff":
      return ShiftRequestStatus.FIXED_OFF;
    case "requestedOff":
      return ShiftRequestStatus.REQUESTED_OFF;
    default:
      return ShiftRequestStatus.AUTO;
  }
};

export const statusVisualMap: Record<ShiftState, ShiftStateVisual> = {
  work: { label: "○", color: "success.main" },
  fixedOff: { label: "固", color: "error.main" },
  requestedOff: { label: "希", color: "warning.main" },
  auto: { label: "△", color: "info.main" },
};

export const defaultStatusVisual: ShiftStateVisual = {
  label: "-",
  color: "text.secondary",
};

export const shiftStateOptions: Array<{ value: ShiftState; label: string }> = [
  { value: "work", label: "出勤" },
  { value: "fixedOff", label: "固定休" },
  { value: "requestedOff", label: "希望休" },
  { value: "auto", label: "自動調整枠" },
];
