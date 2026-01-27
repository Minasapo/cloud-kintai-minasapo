import { ShiftGroupFormValue } from "./shiftGroupValidation";

export const createShiftGroup = (
  initial?: Partial<ShiftGroupFormValue>,
): ShiftGroupFormValue => ({
  id: `sg-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
  label: "",
  description: "",
  min: "",
  max: "",
  fixed: "",
  ...initial,
});
