import { formatTimeRange } from "./mobileCalendarUtils";

describe("formatTimeRange", () => {
  it("開始・終了が両方ある場合は範囲を表示する", () => {
    expect(
      formatTimeRange("2026-03-25T09:00:00+09:00", "2026-03-25T18:00:00+09:00"),
    ).toBe("09:00 〜 18:00");
  });

  it("開始のみある場合は開始時刻を表示する", () => {
    expect(formatTimeRange("2026-03-25T09:00:00+09:00", null)).toBe("09:00 〜 --:--");
  });

  it("終了のみある場合は終了時刻を表示する", () => {
    expect(formatTimeRange(null, "2026-03-25T18:00:00+09:00")).toBe("--:-- 〜 18:00");
  });

  it("開始・終了ともに無い場合は空ラベルを表示する", () => {
    expect(formatTimeRange(null, null)).toBe("--:--");
    expect(formatTimeRange(undefined, undefined, "-")).toBe("-");
  });
});
