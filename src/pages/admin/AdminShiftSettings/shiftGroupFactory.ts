import {
  parseOptionalInteger,
  ShiftGroupFormValue,
} from "./shiftGroupValidation";

export type ShiftGroupSource = {
  label?: string | null;
  description?: string | null;
  min?: number | null;
  max?: number | null;
  fixed?: number | null;
};

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

const toOptionalNumberString = (value?: number | null) =>
  typeof value === "number" && !Number.isNaN(value) ? String(value) : "";

export const toShiftGroupFormValue = (group: ShiftGroupSource) =>
  createShiftGroup({
    label: group.label ?? "",
    description: group.description ?? "",
    min: toOptionalNumberString(group.min),
    max: toOptionalNumberString(group.max),
    fixed: toOptionalNumberString(group.fixed),
  });

export const toShiftGroupPayload = (group: ShiftGroupFormValue) => ({
  label: group.label.trim(),
  description: group.description.trim() ? group.description.trim() : null,
  min: parseOptionalInteger(group.min),
  max: parseOptionalInteger(group.max),
  fixed: parseOptionalInteger(group.fixed),
});

export const buildShiftGroupPayload = (groups: ShiftGroupFormValue[]) =>
  groups.map((group) => toShiftGroupPayload(group));
