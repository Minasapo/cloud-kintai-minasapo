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

export const SHIFT_GROUP_TEXTS = {
  labelRequired: "ラベル名は必須です",
  minInvalid: "0以上の整数で入力してください。",
  maxInvalid: "0以上の整数で入力してください。",
  fixedInvalid: "0以上の整数で入力してください。",
  minOptional: "任意",
  maxOptional: "任意",
  fixedOptional: "任意",
  maxRangeError: "最大人数は最小人数以上にしてください。",
  fixedBelowMin: "最小人数以上を入力してください。",
  fixedAboveMax: "最大人数以下を入力してください。",
  rangeConflict: "固定人数と同時に設定できません。",
  fixedRangeConflict: "固定人数を使う場合は最小/最大を空欄にしてください。",
  rangeAndFixedHint:
    "最小/最大 (レンジ指定) と固定人数は併用できません。いずれか一方のみ入力してください。",
  intro:
    "シフトグループを定義し、公開範囲や担当者単位でシフトを整理できます。ラベル・説明に加えて、各グループの最小／最大人数、または固定人数を任意で設定し、必要に応じて追加・編集・削除してください（レンジ指定と固定人数は同時に使用できません）。",
  saveInfo:
    "入力内容は「保存」ボタンを押すと全社設定に反映され、以降の画面で参照できます。編集途中の変更は自動保存されないためご注意ください。",
  emptyGroups:
    "現在登録されているシフトグループはありません。「グループを追加」から新規に追加できます。",
  validationWarning:
    "ラベル未入力、または人数設定に誤りのあるグループがあります。保存前に修正してください。",
} as const;

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
