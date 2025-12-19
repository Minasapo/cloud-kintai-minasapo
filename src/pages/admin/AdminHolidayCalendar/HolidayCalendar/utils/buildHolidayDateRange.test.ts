import dayjs from "dayjs";

import {
  buildHolidayDateRange,
  HolidayDateRangeError,
  MAX_HOLIDAY_RANGE_DAYS,
} from "./buildHolidayDateRange";

describe("buildHolidayDateRange", () => {
  it("returns a single ISO date when only startDate is provided", () => {
    const start = "2025-01-01";

    const result = buildHolidayDateRange(start);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(dayjs(start).startOf("day").toISOString());
  });

  it("returns all dates between start and end inclusively", () => {
    const result = buildHolidayDateRange("2025-02-01", "2025-02-03");

    expect(result).toEqual([
      dayjs("2025-02-01").startOf("day").toISOString(),
      dayjs("2025-02-02").startOf("day").toISOString(),
      dayjs("2025-02-03").startOf("day").toISOString(),
    ]);
  });

  it("throws when the end date is before the start date", () => {
    expect(() => buildHolidayDateRange("2025-03-10", "2025-03-08")).toThrow(
      HolidayDateRangeError
    );
  });

  it("throws when the requested range exceeds the limit", () => {
    expect(() =>
      buildHolidayDateRange("2025-01-01", "2026-12-31", {
        maxRangeDays: MAX_HOLIDAY_RANGE_DAYS,
      })
    ).toThrow(HolidayDateRangeError);
  });
});
