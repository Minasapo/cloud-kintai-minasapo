import {
  validateAdminConfigForm,
  validateRequiredFields,
  validateTimeRange,
  validateTimeWithinRange,
  validateWorkTimeConfig,
  VALIDATION_ERRORS,
} from "@features/admin/configManagement/lib/validation";
import dayjs, { Dayjs } from "dayjs";

/**
 * テスト用ヘルパー: 時刻文字列をDayjsオブジェクトに変換
 */
const parseTime = (time: string): Dayjs => {
  return dayjs(`2000-01-01 ${time}`, "YYYY-MM-DD HH:mm");
};

describe("validateRequiredFields", () => {
  it("すべての時刻項目が指定されている場合、有効と判定すること", () => {
    const result = validateRequiredFields({
      startTime: parseTime("09:00"),
      endTime: parseTime("18:00"),
      lunchRestStartTime: parseTime("12:00"),
      lunchRestEndTime: parseTime("13:00"),
      amHolidayStartTime: parseTime("09:00"),
      amHolidayEndTime: parseTime("12:00"),
      pmHolidayStartTime: parseTime("13:00"),
      pmHolidayEndTime: parseTime("18:00"),
    });

    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeUndefined();
  });

  it("startTime が未指定の場合、必須項目エラーと判定すること", () => {
    const result = validateRequiredFields({
      startTime: null,
      endTime: parseTime("18:00"),
      lunchRestStartTime: parseTime("12:00"),
      lunchRestEndTime: parseTime("13:00"),
      amHolidayStartTime: parseTime("09:00"),
      amHolidayEndTime: parseTime("12:00"),
      pmHolidayStartTime: parseTime("13:00"),
      pmHolidayEndTime: parseTime("18:00"),
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe(
      VALIDATION_ERRORS.REQUIRED_FIELDS_MISSING
    );
  });

  it("いずれかの時刻項目が未指定の場合、無効と判定すること", () => {
    const result = validateRequiredFields({
      startTime: parseTime("09:00"),
      endTime: parseTime("18:00"),
      lunchRestStartTime: parseTime("12:00"),
      lunchRestEndTime: null,
      amHolidayStartTime: parseTime("09:00"),
      amHolidayEndTime: parseTime("12:00"),
      pmHolidayStartTime: parseTime("13:00"),
      pmHolidayEndTime: parseTime("18:00"),
    });

    expect(result.isValid).toBe(false);
  });
});

describe("validateTimeRange", () => {
  it("開始時刻が終了時刻より前の場合、有効と判定すること", () => {
    const start = parseTime("09:00");
    const end = parseTime("18:00");

    const result = validateTimeRange(start, end, "Test error");

    expect(result.isValid).toBe(true);
  });

  it("開始時刻と終了時刻が同じ場合、無効と判定すること", () => {
    const start = parseTime("12:00");
    const end = parseTime("12:00");

    const result = validateTimeRange(start, end, "Test error");

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe("Test error");
  });

  it("開始時刻が終了時刻より後の場合、無効と判定すること", () => {
    const start = parseTime("18:00");
    const end = parseTime("09:00");

    const result = validateTimeRange(start, end, "Test error");

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe("Test error");
  });
});

describe("validateTimeWithinRange", () => {
  it("判定対象時刻が範囲内の場合、有効と判定すること", () => {
    const checkStart = parseTime("12:00");
    const checkEnd = parseTime("13:00");
    const rangeStart = parseTime("09:00");
    const rangeEnd = parseTime("18:00");

    const result = validateTimeWithinRange(
      checkStart,
      checkEnd,
      rangeStart,
      rangeEnd,
      "Time must be within {start}〜{end}"
    );

    expect(result.isValid).toBe(true);
  });

  it("判定対象時刻が範囲境界と一致する場合、有効と判定すること", () => {
    const checkStart = parseTime("09:00");
    const checkEnd = parseTime("18:00");
    const rangeStart = parseTime("09:00");
    const rangeEnd = parseTime("18:00");

    const result = validateTimeWithinRange(
      checkStart,
      checkEnd,
      rangeStart,
      rangeEnd,
      "Time must be within {start}〜{end}"
    );

    expect(result.isValid).toBe(true);
  });

  it("開始時刻が範囲開始より前の場合、無効と判定すること", () => {
    const checkStart = parseTime("08:00");
    const checkEnd = parseTime("13:00");
    const rangeStart = parseTime("09:00");
    const rangeEnd = parseTime("18:00");

    const result = validateTimeWithinRange(
      checkStart,
      checkEnd,
      rangeStart,
      rangeEnd,
      "Time must be within {start}〜{end}"
    );

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe("Time must be within 09:00〜18:00");
  });

  it("終了時刻が範囲終了より後の場合、無効と判定すること", () => {
    const checkStart = parseTime("12:00");
    const checkEnd = parseTime("19:00");
    const rangeStart = parseTime("09:00");
    const rangeEnd = parseTime("18:00");

    const result = validateTimeWithinRange(
      checkStart,
      checkEnd,
      rangeStart,
      rangeEnd,
      "Time must be within {start}〜{end}"
    );

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe("Time must be within 09:00〜18:00");
  });
});

describe("validateWorkTimeConfig", () => {
  const validConfig = {
    startTime: parseTime("09:00"),
    endTime: parseTime("18:00"),
    lunchRestStartTime: parseTime("12:00"),
    lunchRestEndTime: parseTime("13:00"),
    amHolidayStartTime: parseTime("09:00"),
    amHolidayEndTime: parseTime("12:00"),
    pmHolidayStartTime: parseTime("13:00"),
    pmHolidayEndTime: parseTime("18:00"),
  };

  it("勤務時間設定が正しい場合、有効と判定すること", () => {
    const result = validateWorkTimeConfig(validConfig);

    expect(result.isValid).toBe(true);
  });

  it("勤務終了時刻が開始時刻より前の場合、勤務時間エラーを返すこと", () => {
    const result = validateWorkTimeConfig({
      ...validConfig,
      startTime: parseTime("18:00"),
      endTime: parseTime("09:00"),
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe(VALIDATION_ERRORS.WORK_TIME_INVALID);
  });

  it("休憩終了時刻が休憩開始時刻より前の場合、休憩時間エラーを返すこと", () => {
    const result = validateWorkTimeConfig({
      ...validConfig,
      lunchRestStartTime: parseTime("13:00"),
      lunchRestEndTime: parseTime("12:00"),
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe(VALIDATION_ERRORS.LUNCH_TIME_INVALID);
  });

  it("休憩時間が勤務時間外の場合、範囲エラーを返すこと", () => {
    const result = validateWorkTimeConfig({
      ...validConfig,
      lunchRestStartTime: parseTime("08:00"),
      lunchRestEndTime: parseTime("09:00"),
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain("09:00〜18:00");
  });

  it("午前半休の終了時刻が開始時刻より前の場合、午前半休エラーを返すこと", () => {
    const result = validateWorkTimeConfig({
      ...validConfig,
      amHolidayStartTime: parseTime("12:00"),
      amHolidayEndTime: parseTime("09:00"),
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe(
      VALIDATION_ERRORS.AM_HOLIDAY_TIME_INVALID
    );
  });

  it("午前半休時間が勤務時間外の場合、午前半休範囲エラーを返すこと", () => {
    const result = validateWorkTimeConfig({
      ...validConfig,
      amHolidayStartTime: parseTime("08:00"),
      amHolidayEndTime: parseTime("12:00"),
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe(
      VALIDATION_ERRORS.AM_HOLIDAY_NOT_IN_WORK_TIME
    );
  });

  it("午後半休の終了時刻が開始時刻より前の場合、午後半休エラーを返すこと", () => {
    const result = validateWorkTimeConfig({
      ...validConfig,
      pmHolidayStartTime: parseTime("18:00"),
      pmHolidayEndTime: parseTime("13:00"),
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe(
      VALIDATION_ERRORS.PM_HOLIDAY_TIME_INVALID
    );
  });

  it("午後半休時間が勤務時間外の場合、午後半休範囲エラーを返すこと", () => {
    const result = validateWorkTimeConfig({
      ...validConfig,
      pmHolidayStartTime: parseTime("13:00"),
      pmHolidayEndTime: parseTime("19:00"),
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe(
      VALIDATION_ERRORS.PM_HOLIDAY_NOT_IN_WORK_TIME
    );
  });
});

describe("validateAdminConfigForm", () => {
  it("フォームが完全かつ妥当な場合、有効と判定すること", () => {
    const result = validateAdminConfigForm({
      startTime: parseTime("09:00"),
      endTime: parseTime("18:00"),
      lunchRestStartTime: parseTime("12:00"),
      lunchRestEndTime: parseTime("13:00"),
      amHolidayStartTime: parseTime("09:00"),
      amHolidayEndTime: parseTime("12:00"),
      pmHolidayStartTime: parseTime("13:00"),
      pmHolidayEndTime: parseTime("18:00"),
    });

    expect(result.isValid).toBe(true);
  });

  it("必須項目が不足している場合、必須項目チェックで失敗すること", () => {
    const result = validateAdminConfigForm({
      startTime: null,
      endTime: parseTime("18:00"),
      lunchRestStartTime: parseTime("12:00"),
      lunchRestEndTime: parseTime("13:00"),
      amHolidayStartTime: parseTime("09:00"),
      amHolidayEndTime: parseTime("12:00"),
      pmHolidayStartTime: parseTime("13:00"),
      pmHolidayEndTime: parseTime("18:00"),
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe(
      VALIDATION_ERRORS.REQUIRED_FIELDS_MISSING
    );
  });

  it("必須項目が満たされた後に時刻ロジックを検証すること", () => {
    const result = validateAdminConfigForm({
      startTime: parseTime("18:00"),
      endTime: parseTime("09:00"),
      lunchRestStartTime: parseTime("12:00"),
      lunchRestEndTime: parseTime("13:00"),
      amHolidayStartTime: parseTime("09:00"),
      amHolidayEndTime: parseTime("12:00"),
      pmHolidayStartTime: parseTime("13:00"),
      pmHolidayEndTime: parseTime("18:00"),
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe(VALIDATION_ERRORS.WORK_TIME_INVALID);
  });
});
