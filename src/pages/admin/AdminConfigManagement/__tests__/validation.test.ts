import dayjs, { Dayjs } from "dayjs";

import {
  validateAdminConfigForm,
  validateTimeRange,
  validateTimeWithinRange,
  validateWorkTimeConfig,
  VALIDATION_ERRORS,
} from "../validation";

/**
 * テスト用ヘルパー: 時刻文字列をDayjsオブジェクトに変換
 */
const parseTime = (time: string): Dayjs => {
  return dayjs(`2000-01-01 ${time}`, "YYYY-MM-DD HH:mm");
};

describe("AdminConfigManagement Validation", () => {
  describe("validateTimeRange", () => {
    it("should return valid when start is before end", () => {
      const start = parseTime("09:00");
      const end = parseTime("18:00");

      const result = validateTimeRange(start, end, "Test error");

      expect(result.isValid).toBe(true);
    });

    it("should return invalid when start equals end", () => {
      const start = parseTime("12:00");
      const end = parseTime("12:00");

      const result = validateTimeRange(start, end, "Test error");

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Test error");
    });

    it("should return invalid when start is after end", () => {
      const start = parseTime("18:00");
      const end = parseTime("09:00");

      const result = validateTimeRange(start, end, "Test error");

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Test error");
    });
  });

  describe("validateTimeWithinRange", () => {
    it("should return valid when time is within range", () => {
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

    it("should return valid when time matches range boundaries", () => {
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

    it("should return invalid when start is before range", () => {
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

    it("should return invalid when end is after range", () => {
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

    it("should return valid for correct configuration", () => {
      const result = validateWorkTimeConfig(validConfig);

      expect(result.isValid).toBe(true);
    });

    it("should return valid when all fields are null", () => {
      const result = validateWorkTimeConfig({
        startTime: null,
        endTime: null,
        lunchRestStartTime: null,
        lunchRestEndTime: null,
        amHolidayStartTime: null,
        amHolidayEndTime: null,
        pmHolidayStartTime: null,
        pmHolidayEndTime: null,
      });

      expect(result.isValid).toBe(true);
    });

    it("should return valid when only start time is set", () => {
      const result = validateWorkTimeConfig({
        startTime: parseTime("09:00"),
        endTime: null,
        lunchRestStartTime: null,
        lunchRestEndTime: null,
        amHolidayStartTime: null,
        amHolidayEndTime: null,
        pmHolidayStartTime: null,
        pmHolidayEndTime: null,
      });

      expect(result.isValid).toBe(true);
    });

    it("should return invalid when work end time is before start time", () => {
      const result = validateWorkTimeConfig({
        ...validConfig,
        startTime: parseTime("18:00"),
        endTime: parseTime("09:00"),
      });

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(VALIDATION_ERRORS.WORK_TIME_INVALID);
    });

    it("should return invalid when lunch end is before lunch start", () => {
      const result = validateWorkTimeConfig({
        ...validConfig,
        lunchRestStartTime: parseTime("13:00"),
        lunchRestEndTime: parseTime("12:00"),
      });

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(VALIDATION_ERRORS.LUNCH_TIME_INVALID);
    });

    it("should return invalid when lunch is outside work time", () => {
      const result = validateWorkTimeConfig({
        ...validConfig,
        lunchRestStartTime: parseTime("08:00"),
        lunchRestEndTime: parseTime("09:00"),
      });

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("09:00〜18:00");
    });

    it("should return invalid when AM holiday end is before start", () => {
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

    it("should return invalid when AM holiday is outside work time", () => {
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

    it("should return invalid when PM holiday end is before start", () => {
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

    it("should return invalid when PM holiday is outside work time", () => {
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
    it("should return valid for complete valid form", () => {
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

    it("should return valid for form with only start time", () => {
      const result = validateAdminConfigForm({
        startTime: parseTime("09:00"),
        endTime: null,
        lunchRestStartTime: null,
        lunchRestEndTime: null,
        amHolidayStartTime: null,
        amHolidayEndTime: null,
        pmHolidayStartTime: null,
        pmHolidayEndTime: null,
      });

      expect(result.isValid).toBe(true);
    });

    it("should return valid when all fields are null", () => {
      const result = validateAdminConfigForm({
        startTime: null,
        endTime: null,
        lunchRestStartTime: null,
        lunchRestEndTime: null,
        amHolidayStartTime: null,
        amHolidayEndTime: null,
        pmHolidayStartTime: null,
        pmHolidayEndTime: null,
      });

      expect(result.isValid).toBe(true);
    });

    it("should validate time logic when fields are present", () => {
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
});
