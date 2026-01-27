import type { ShiftGroupConfig } from "@entities/app-config/model/shiftGroupTypes";

import { SHIFT_GROUP_VALIDATION_TEXTS } from "./shiftGroupTexts.validation";

export type ShiftGroupFormValue = {
  id: string;
  label: string;
  description: string;
  min: string;
  max: string;
  fixed: string;
};

export type { ShiftGroupConfig };

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
  const getMinHelperText = () => {
    if (validation.minInputError) {
      return SHIFT_GROUP_VALIDATION_TEXTS.minInvalid;
    }
    if (validation.fixedWithRangeConflict) {
      return SHIFT_GROUP_VALIDATION_TEXTS.rangeConflict;
    }
    return SHIFT_GROUP_VALIDATION_TEXTS.minOptional;
  };

  const getMaxHelperText = () => {
    if (validation.maxInputError) {
      return SHIFT_GROUP_VALIDATION_TEXTS.maxInvalid;
    }
    if (validation.rangeError) {
      return SHIFT_GROUP_VALIDATION_TEXTS.maxRangeError;
    }
    if (validation.fixedWithRangeConflict) {
      return SHIFT_GROUP_VALIDATION_TEXTS.rangeConflict;
    }
    return SHIFT_GROUP_VALIDATION_TEXTS.maxOptional;
  };

  const getFixedHelperText = () => {
    if (validation.fixedInputError) {
      return SHIFT_GROUP_VALIDATION_TEXTS.fixedInvalid;
    }
    if (validation.fixedBelowMin) {
      return SHIFT_GROUP_VALIDATION_TEXTS.fixedBelowMin;
    }
    if (validation.fixedAboveMax) {
      return SHIFT_GROUP_VALIDATION_TEXTS.fixedAboveMax;
    }
    if (validation.fixedWithRangeConflict) {
      return SHIFT_GROUP_VALIDATION_TEXTS.fixedRangeConflict;
    }
    return SHIFT_GROUP_VALIDATION_TEXTS.fixedOptional;
  };

  return {
    minHelperText: getMinHelperText(),
    maxHelperText: getMaxHelperText(),
    fixedHelperText: getFixedHelperText(),
  };
};
