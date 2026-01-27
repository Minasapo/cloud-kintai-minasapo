import { ShiftGroupFormValue } from "./shiftGroupValidation";

export const createShiftGroupId = () =>
  `sg-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

export const createShiftGroup = (
  initial?: Partial<ShiftGroupFormValue>,
): ShiftGroupFormValue => ({
  id: createShiftGroupId(),
  label: "",
  description: "",
  min: "",
  max: "",
  fixed: "",
  ...initial,
});
