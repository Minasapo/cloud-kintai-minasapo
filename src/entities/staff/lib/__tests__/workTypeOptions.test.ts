import { getWorkTypeLabel, isShiftWorkType } from "../workTypeOptions";

describe("getWorkTypeLabel", () => {
  it.each([
    ["weekday", "平日勤務"],
    ["shift", "シフト勤務"],
    ["unknown", ""],
  ])("%s に対応するラベルを返すこと", (input, expected) => {
    expect(getWorkTypeLabel(input)).toBe(expected);
  });

  it("undefined の場合はデフォルトの平日勤務を返すこと", () => {
    expect(getWorkTypeLabel(undefined)).toBe("平日勤務");
  });

  it("null の場合はデフォルトの平日勤務を返すこと", () => {
    expect(getWorkTypeLabel(null)).toBe("平日勤務");
  });
});

describe("isShiftWorkType", () => {
  it("shift の場合は true を返すこと", () => {
    expect(isShiftWorkType("shift")).toBe(true);
  });

  it.each(["weekday", undefined, null, ""])(
    "%s の場合は false を返すこと",
    (input) => {
      expect(isShiftWorkType(input)).toBe(false);
    },
  );
});
