import { SHIFT_GROUP_TEXTS } from "./shiftGroupTexts";

export type ShiftGroupFormValue = {
  id: string;
  label: string;
  description: string;
  min: string;
  max: string;
  fixed: string;
};

export type GroupValidationResult = {
  labelError: boolean;
  minInputError: boolean;
  maxInputError: boolean;
  fixedInputError: boolean;
  rangeError: boolean;
  fixedBelowMin: boolean;
  fixedAboveMax: boolean;
  fixedWithRangeConflict: boolean;
  minValue: number | null;
  maxValue: number | null;
  fixedValue: number | null;
  hasError: boolean;
};

export type GroupHelperTexts = {
  minHelperText: string;
  maxHelperText: string;
  fixedHelperText: string;
};

const isNonNegativeIntegerString = (value: string) => {
  const trimmed = value.trim();
  return trimmed === "" || /^\d+$/.test(trimmed);
};

export const parseOptionalInteger = (value: string): number | null => {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
};

export const getGroupValidation = (
  group: ShiftGroupFormValue,
): GroupValidationResult => {
  const labelError = group.label.trim() === "";
  const minInputError = !isNonNegativeIntegerString(group.min);
  const maxInputError = !isNonNegativeIntegerString(group.max);
  const fixedInputError = !isNonNegativeIntegerString(group.fixed);

  const minValue = minInputError ? null : parseOptionalInteger(group.min);
  const maxValue = maxInputError ? null : parseOptionalInteger(group.max);
  const fixedValue = fixedInputError ? null : parseOptionalInteger(group.fixed);

  const rangeError =
    minValue !== null && maxValue !== null && minValue > maxValue;
  const fixedBelowMin =
    fixedValue !== null && minValue !== null && fixedValue < minValue;
  const fixedAboveMax =
    fixedValue !== null && maxValue !== null && fixedValue > maxValue;
  const fixedWithRangeConflict =
    fixedValue !== null && (minValue !== null || maxValue !== null);

  return {
    labelError,
    minInputError,
    maxInputError,
    fixedInputError,
    rangeError,
    fixedBelowMin,
    fixedAboveMax,
    fixedWithRangeConflict,
    minValue,
    maxValue,
    fixedValue,
    hasError:
      labelError ||
      minInputError ||
      maxInputError ||
      fixedInputError ||
      rangeError ||
      fixedBelowMin ||
      fixedAboveMax ||
      fixedWithRangeConflict,
  };
};

export const getHelperTexts = (
  validation: GroupValidationResult,
): GroupHelperTexts => {
  const minHelperText = validation.minInputError
    ? SHIFT_GROUP_TEXTS.minInvalid
    : validation.fixedWithRangeConflict
      ? SHIFT_GROUP_TEXTS.rangeConflict
      : SHIFT_GROUP_TEXTS.minOptional;
  const maxHelperText = validation.maxInputError
    ? SHIFT_GROUP_TEXTS.maxInvalid
    : validation.rangeError
      ? SHIFT_GROUP_TEXTS.maxRangeError
      : validation.fixedWithRangeConflict
        ? SHIFT_GROUP_TEXTS.rangeConflict
        : SHIFT_GROUP_TEXTS.maxOptional;
  const fixedHelperText = validation.fixedInputError
    ? SHIFT_GROUP_TEXTS.fixedInvalid
    : validation.fixedBelowMin
      ? SHIFT_GROUP_TEXTS.fixedBelowMin
      : validation.fixedAboveMax
        ? SHIFT_GROUP_TEXTS.fixedAboveMax
        : validation.fixedWithRangeConflict
          ? SHIFT_GROUP_TEXTS.fixedRangeConflict
          : SHIFT_GROUP_TEXTS.fixedOptional;

  return { minHelperText, maxHelperText, fixedHelperText };
};
