import { getWorkTypeLabel, isShiftWorkType } from "./workTypeOptions";

describe("workTypeOptions", () => {
  it("returns shift label for shift work type", () => {
    expect(getWorkTypeLabel("shift")).toBe("シフト勤務");
  });

  it("treats only shift as shift work type", () => {
    expect(isShiftWorkType("shift")).toBe(true);
    expect(isShiftWorkType("weekday")).toBe(false);
    expect(isShiftWorkType(null)).toBe(false);
    expect(isShiftWorkType(undefined)).toBe(false);
  });
});
