import { describe, expect, it } from "@jest/globals";

import { buildClockTimeDayjs } from "./clockTime";

describe("clockTime", () => {
  describe("buildClockTimeDayjs", () => {
    it("HH:mm の時刻文字列を dayjs に変換する", () => {
      const result = buildClockTimeDayjs("09:30");

      expect(result.isValid()).toBe(true);
      expect(result.format("HH:mm:ss.SSS")).toBe("09:30:00.000");
    });

    it("1桁の時も受け付ける", () => {
      const result = buildClockTimeDayjs("9:05");

      expect(result.isValid()).toBe(true);
      expect(result.format("HH:mm:ss.SSS")).toBe("09:05:00.000");
    });

    it("不正値はフォールバック時刻を使う", () => {
      const result = buildClockTimeDayjs("", "18:00");

      expect(result.isValid()).toBe(true);
      expect(result.format("HH:mm:ss.SSS")).toBe("18:00:00.000");
    });
  });
});
