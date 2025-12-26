import { buildCalendarTagId, nonNullable } from "../calendarApi";

describe("calendarApi utils", () => {
  describe("nonNullable", () => {
    it("nullとundefinedを除外する", () => {
      const values = ["a", null, undefined, "b"].filter(nonNullable);
      expect(values).toEqual(["a", "b"]);
    });
  });

  describe("buildCalendarTagId", () => {
    it("idがあればそれを優先する", () => {
      expect(
        buildCalendarTagId({ id: "id-1", holidayDate: "2024-01-01" })
      ).toBe("id-1");
    });

    it("idが無くholidayDateがあればそれを使う", () => {
      expect(buildCalendarTagId({ holidayDate: "2024-02-02" })).toBe(
        "2024-02-02"
      );
    });

    it("両方無ければunknownを返す", () => {
      expect(buildCalendarTagId({})).toBe("unknown");
    });
  });
});
