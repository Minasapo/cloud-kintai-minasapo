import { ShiftGroupFormValue } from "./shiftGroupValidation";

export const createShiftGroupId = (
  now: () => number = Date.now,
  random: () => number = Math.random,
) => `sg-${now()}-${random().toString(16).slice(2, 10)}`;

export const createShiftGroup = (
  initial?: Partial<ShiftGroupFormValue>,
  deps?: {
    now?: () => number;
    random?: () => number;
  },
): ShiftGroupFormValue => ({
  id: createShiftGroupId(deps?.now, deps?.random),
  label: "",
  description: "",
  min: "",
  max: "",
  fixed: "",
  ...initial,
});
