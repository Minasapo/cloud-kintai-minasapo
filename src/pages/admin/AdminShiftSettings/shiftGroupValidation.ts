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
    ? "0以上の整数で入力してください。"
    : validation.fixedWithRangeConflict
      ? "固定人数と同時に設定できません。"
      : "任意";
  const maxHelperText = validation.maxInputError
    ? "0以上の整数で入力してください。"
    : validation.rangeError
      ? "最大人数は最小人数以上にしてください。"
      : validation.fixedWithRangeConflict
        ? "固定人数と同時に設定できません。"
        : "任意";
  const fixedHelperText = validation.fixedInputError
    ? "0以上の整数で入力してください。"
    : validation.fixedBelowMin
      ? "最小人数以上を入力してください。"
      : validation.fixedAboveMax
        ? "最大人数以下を入力してください。"
        : validation.fixedWithRangeConflict
          ? "固定人数を使う場合は最小/最大を空欄にしてください。"
          : "任意";

  return { minHelperText, maxHelperText, fixedHelperText };
};
