import dayjs from "dayjs";

import {
  buildHolidayDateRange,
  HolidayDateRangeError,
  MAX_HOLIDAY_RANGE_DAYS,
} from "../buildHolidayDateRange";

describe("buildHolidayDateRange", () => {
  describe("single-day range (no endDate)", () => {
    it("有効な単日の日付に対して ISO 文字列を1件返すこと", () => {
      const result = buildHolidayDateRange("2024-01-01");
      expect(result).toHaveLength(1);
      expect(dayjs(result[0]).format("YYYY-MM-DD")).toBe("2024-01-01");
    });

    it("endDate が null の場合、ISO 文字列を返すこと", () => {
      const result = buildHolidayDateRange("2024-06-15", null);
      expect(result).toHaveLength(1);
      expect(dayjs(result[0]).format("YYYY-MM-DD")).toBe("2024-06-15");
    });
  });

  describe("multi-day range", () => {
    it("日付範囲に対して正しい日数分を返すこと", () => {
      const result = buildHolidayDateRange("2024-01-01", "2024-01-07");
      expect(result).toHaveLength(7);
    });

    it("先頭と末尾の要素が開始日と終了日に対応すること", () => {
      const result = buildHolidayDateRange("2024-03-01", "2024-03-03");
      expect(dayjs(result[0]).format("YYYY-MM-DD")).toBe("2024-03-01");
      expect(dayjs(result[2]).format("YYYY-MM-DD")).toBe("2024-03-03");
    });

    it("連続した日付を順序通りに返すこと", () => {
      const result = buildHolidayDateRange("2024-01-01", "2024-01-03");
      expect(dayjs(result[0]).format("YYYY-MM-DD")).toBe("2024-01-01");
      expect(dayjs(result[1]).format("YYYY-MM-DD")).toBe("2024-01-02");
      expect(dayjs(result[2]).format("YYYY-MM-DD")).toBe("2024-01-03");
    });
  });

  describe("error cases", () => {
    it("startDate が空の場合、INVALID_START_DATE を throw すること", () => {
      expect(() => buildHolidayDateRange("")).toThrow(HolidayDateRangeError);
      try {
        buildHolidayDateRange("");
      } catch (e) {
        expect((e as HolidayDateRangeError).code).toBe("INVALID_START_DATE");
      }
    });

    it("end が start より前の場合、END_BEFORE_START を throw すること", () => {
      expect(() => buildHolidayDateRange("2024-01-10", "2024-01-01")).toThrow(
        HolidayDateRangeError
      );
      try {
        buildHolidayDateRange("2024-01-10", "2024-01-01");
      } catch (e) {
        expect((e as HolidayDateRangeError).code).toBe("END_BEFORE_START");
      }
    });

    it("範囲が MAX_HOLIDAY_RANGE_DAYS を超える場合、RANGE_TOO_LARGE を throw すること", () => {
      const start = "2020-01-01";
      const end = "2022-01-01"; // ~730 days
      expect(() => buildHolidayDateRange(start, end)).toThrow(
        HolidayDateRangeError
      );
      try {
        buildHolidayDateRange(start, end);
      } catch (e) {
        expect((e as HolidayDateRangeError).code).toBe("RANGE_TOO_LARGE");
      }
    });

    it("custom maxRangeDays オプションを尊重すること", () => {
      expect(() =>
        buildHolidayDateRange("2024-01-01", "2024-01-10", { maxRangeDays: 5 })
      ).toThrow(HolidayDateRangeError);
    });
  });

  describe("boundary cases", () => {
    it("開始日と終了日が同日の場合、1件返すこと", () => {
      const result = buildHolidayDateRange("2024-05-05", "2024-05-05");
      expect(result).toHaveLength(1);
    });

    it("ちょうど MAX_HOLIDAY_RANGE_DAYS 日の場合、成功すること", () => {
      const start = "2024-01-01";
      const end = dayjs(start)
        .add(MAX_HOLIDAY_RANGE_DAYS - 1, "day")
        .format("YYYY-MM-DD");
      const result = buildHolidayDateRange(start, end);
      expect(result).toHaveLength(MAX_HOLIDAY_RANGE_DAYS);
    });

    it("MAX_HOLIDAY_RANGE_DAYS + 1 日では RANGE_TOO_LARGE を throw すること", () => {
      const start = "2024-01-01";
      const end = dayjs(start)
        .add(MAX_HOLIDAY_RANGE_DAYS, "day")
        .format("YYYY-MM-DD");
      expect(() => buildHolidayDateRange(start, end)).toThrow(
        HolidayDateRangeError
      );
    });
  });
});
