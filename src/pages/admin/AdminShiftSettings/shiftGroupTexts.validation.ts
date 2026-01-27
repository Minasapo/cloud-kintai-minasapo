const OPTIONAL_TEXT = "任意";
const NON_NEGATIVE_INTEGER_TEXT = "0以上の整数で入力してください。";

export const SHIFT_GROUP_VALIDATION_TEXTS = {
  labelRequired: "ラベル名は必須です",
  minInvalid: NON_NEGATIVE_INTEGER_TEXT,
  maxInvalid: NON_NEGATIVE_INTEGER_TEXT,
  fixedInvalid: NON_NEGATIVE_INTEGER_TEXT,
  minOptional: OPTIONAL_TEXT,
  maxOptional: OPTIONAL_TEXT,
  fixedOptional: OPTIONAL_TEXT,
  maxRangeError: "最大人数は最小人数以上にしてください。",
  fixedBelowMin: "最小人数以上を入力してください。",
  fixedAboveMax: "最大人数以下を入力してください。",
  rangeConflict: "固定人数と同時に設定できません。",
  fixedRangeConflict: "固定人数を使う場合は最小/最大を空欄にしてください。",
} as const;
