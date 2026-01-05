import { Dayjs } from "dayjs";

/**
 * バリデーション結果の型
 */
export type ValidationResult = {
  isValid: boolean;
  errorMessage?: string;
};

/**
 * バリデーションエラーメッセージ定数
 */
export const VALIDATION_ERRORS = {
  WORK_TIME_INVALID: "勤務開始時刻は終了時刻より前である必要があります",
  LUNCH_TIME_INVALID: "昼休憩開始時刻は終了時刻より前である必要があります",
  LUNCH_NOT_IN_WORK_TIME:
    "昼休憩時間は勤務時間内（{start}〜{end}）に収まる必要があります",
  AM_HOLIDAY_TIME_INVALID:
    "午前半休開始時刻は終了時刻より前である必要があります",
  PM_HOLIDAY_TIME_INVALID:
    "午後半休開始時刻は終了時刻より前である必要があります",
  AM_HOLIDAY_NOT_IN_WORK_TIME: "午前半休時間は勤務時間内に収まる必要があります",
  PM_HOLIDAY_NOT_IN_WORK_TIME: "午後半休時間は勤務時間内に収まる必要があります",
} as const;

/**
 * 必須フィールドの存在チェック
 */
/**
 * 開始時刻 < 終了時刻のバリデーション
 */
export const validateTimeRange = (
  startTime: Dayjs,
  endTime: Dayjs,
  errorMessage: string
): ValidationResult => {
  if (!startTime.isBefore(endTime)) {
    return {
      isValid: false,
      errorMessage,
    };
  }
  return { isValid: true };
};

/**
 * 時刻が指定範囲内に収まっているかのバリデーション
 */
export const validateTimeWithinRange = (
  checkStartTime: Dayjs,
  checkEndTime: Dayjs,
  rangeStartTime: Dayjs,
  rangeEndTime: Dayjs,
  errorMessage: string
): ValidationResult => {
  // 開始時刻が範囲の開始以降かつ終了時刻が範囲の終了以前
  const isStartValid =
    checkStartTime.isAfter(rangeStartTime) ||
    checkStartTime.isSame(rangeStartTime);
  const isEndValid =
    checkEndTime.isBefore(rangeEndTime) || checkEndTime.isSame(rangeEndTime);

  if (!isStartValid || !isEndValid) {
    return {
      isValid: false,
      errorMessage: errorMessage
        .replace("{start}", rangeStartTime.format("HH:mm"))
        .replace("{end}", rangeEndTime.format("HH:mm")),
    };
  }

  return { isValid: true };
};

/**
 * 勤務時間設定の包括的バリデーション
 * 各時刻フィールドはオプショナルだが、両方設定されている場合は整合性をチェック
 */
export const validateWorkTimeConfig = (config: {
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  lunchRestStartTime: Dayjs | null;
  lunchRestEndTime: Dayjs | null;
  amHolidayStartTime: Dayjs | null;
  amHolidayEndTime: Dayjs | null;
  pmHolidayStartTime: Dayjs | null;
  pmHolidayEndTime: Dayjs | null;
}): ValidationResult => {
  const {
    startTime,
    endTime,
    lunchRestStartTime,
    lunchRestEndTime,
    amHolidayStartTime,
    amHolidayEndTime,
    pmHolidayStartTime,
    pmHolidayEndTime,
  } = config;

  // 1. 勤務時間の開始 < 終了チェック（両方設定されている場合のみ）
  if (startTime && endTime) {
    const workTimeResult = validateTimeRange(
      startTime,
      endTime,
      VALIDATION_ERRORS.WORK_TIME_INVALID
    );
    if (!workTimeResult.isValid) return workTimeResult;
  }

  // 2. 昼休憩の開始 < 終了チェック（両方設定されている場合のみ）
  if (lunchRestStartTime && lunchRestEndTime) {
    const lunchTimeResult = validateTimeRange(
      lunchRestStartTime,
      lunchRestEndTime,
      VALIDATION_ERRORS.LUNCH_TIME_INVALID
    );
    if (!lunchTimeResult.isValid) return lunchTimeResult;

    // 3. 昼休憩が勤務時間内に収まっているかチェック（勤務時間も設定されている場合のみ）
    if (startTime && endTime) {
      const lunchInWorkResult = validateTimeWithinRange(
        lunchRestStartTime,
        lunchRestEndTime,
        startTime,
        endTime,
        VALIDATION_ERRORS.LUNCH_NOT_IN_WORK_TIME
      );
      if (!lunchInWorkResult.isValid) return lunchInWorkResult;
    }
  }

  // 4. 午前半休の開始 < 終了チェック（両方設定されている場合のみ）
  if (amHolidayStartTime && amHolidayEndTime) {
    const amHolidayTimeResult = validateTimeRange(
      amHolidayStartTime,
      amHolidayEndTime,
      VALIDATION_ERRORS.AM_HOLIDAY_TIME_INVALID
    );
    if (!amHolidayTimeResult.isValid) return amHolidayTimeResult;

    // 5. 午前半休が勤務時間内に収まっているかチェック（勤務時間も設定されている場合のみ）
    if (startTime && endTime) {
      const amHolidayInWorkResult = validateTimeWithinRange(
        amHolidayStartTime,
        amHolidayEndTime,
        startTime,
        endTime,
        VALIDATION_ERRORS.AM_HOLIDAY_NOT_IN_WORK_TIME
      );
      if (!amHolidayInWorkResult.isValid) return amHolidayInWorkResult;
    }
  }

  // 6. 午後半休の開始 < 終了チェック（両方設定されている場合のみ）
  if (pmHolidayStartTime && pmHolidayEndTime) {
    const pmHolidayTimeResult = validateTimeRange(
      pmHolidayStartTime,
      pmHolidayEndTime,
      VALIDATION_ERRORS.PM_HOLIDAY_TIME_INVALID
    );
    if (!pmHolidayTimeResult.isValid) return pmHolidayTimeResult;

    // 7. 午後半休が勤務時間内に収まっているかチェック（勤務時間も設定されている場合のみ）
    if (startTime && endTime) {
      const pmHolidayInWorkResult = validateTimeWithinRange(
        pmHolidayStartTime,
        pmHolidayEndTime,
        startTime,
        endTime,
        VALIDATION_ERRORS.PM_HOLIDAY_NOT_IN_WORK_TIME
      );
      if (!pmHolidayInWorkResult.isValid) return pmHolidayInWorkResult;
    }
  }

  return { isValid: true };
};

/**
 * フォーム全体のバリデーション
 * すべてのフィールドがオプショナル。設定されている場合のみ整合性をチェック
 */
export const validateAdminConfigForm = (fields: {
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  lunchRestStartTime: Dayjs | null;
  lunchRestEndTime: Dayjs | null;
  amHolidayStartTime: Dayjs | null;
  amHolidayEndTime: Dayjs | null;
  pmHolidayStartTime: Dayjs | null;
  pmHolidayEndTime: Dayjs | null;
}): ValidationResult => {
  return validateWorkTimeConfig(fields);
};
