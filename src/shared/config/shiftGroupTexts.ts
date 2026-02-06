const OPTIONAL_TEXT = "任意";
const NON_NEGATIVE_INTEGER_TEXT = "0以上の整数で入力してください。";

export const SHIFT_GROUP_TEXTS = {
  ui: {
    introTitle: "シフトグループ設定のポイント",
    introBullets: [
      "ラベル名は必須です。",
      "人数設定は 最小 最大 か 固定人数 のどちらか一方のみ設定できます。",
      "変更内容は 自動保存されません。保存ボタンを押して反映してください。",
    ],
    rangeAndFixedHint:
      "最小/最大 (レンジ指定) と固定人数は併用できません。いずれか一方のみ入力してください。",
    saveInfo:
      "入力内容は「保存」ボタンを押すと全社設定に反映され、以降の画面で参照できます。編集途中の変更は自動保存されないためご注意ください。",
    emptyGroups:
      "現在登録されているシフトグループはありません。「グループを追加」から新規に追加できます。",
    validationWarning:
      "ラベル未入力、または人数設定に誤りのあるグループがあります。保存前に修正してください。",
    descriptionHelperText: "50文字以内を目安に入力",
  },
  validation: {
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
  },
} as const;

export const SHIFT_GROUP_UI_TEXTS = SHIFT_GROUP_TEXTS.ui;
export const SHIFT_GROUP_VALIDATION_TEXTS = SHIFT_GROUP_TEXTS.validation;
