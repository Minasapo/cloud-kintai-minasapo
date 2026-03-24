import {
  resolveBusinessWorkDate,
  resolveCurrentBusinessWorkDate,
} from "@/entities/attendance/lib/businessDate";

describe("businessDate", () => {
  it("resolves work date in Asia/Tokyo from occurredAt", () => {
    expect(resolveBusinessWorkDate("2026-03-23T14:59:00.000Z")).toBe(
      "2026-03-23",
    );
    expect(resolveBusinessWorkDate("2026-03-23T15:01:00.000Z")).toBe(
      "2026-03-24",
    );
  });

  it("supports day boundary hour", () => {
    expect(
      resolveBusinessWorkDate("2026-03-23T18:30:00.000Z", {
        dayBoundaryHour: 5,
      }),
    ).toBe("2026-03-23");
  });

  it("throws when occurredAt is invalid", () => {
    expect(() => resolveBusinessWorkDate("not-a-date")).toThrow(
      "Invalid occurredAt value",
    );
  });

  it("returns current work date in YYYY-MM-DD format", () => {
    expect(resolveCurrentBusinessWorkDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

