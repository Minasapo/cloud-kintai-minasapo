import { SelectedDateMap } from "./statusMapping";

export type ShiftRequestSummary = {
  workDays: number;
  fixedOffDays: number;
  requestedOffDays: number;
};

export const createShiftRequestSummary = (
  selectedDates: SelectedDateMap,
): ShiftRequestSummary => ({
  workDays: Object.values(selectedDates).filter((v) => v.status === "work")
    .length,
  fixedOffDays: Object.values(selectedDates).filter(
    (v) => v.status === "fixedOff",
  ).length,
  requestedOffDays: Object.values(selectedDates).filter(
    (v) => v.status === "requestedOff",
  ).length,
});

