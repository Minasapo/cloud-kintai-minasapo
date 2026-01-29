import dayjs from "dayjs";

import { resolveConfigTimeOnDate } from "../resolveConfigTimeOnDate";

describe("resolveConfigTimeOnDate", () => {
  describe("基本的な動作", () => {
    it("設定時刻を指定した日付に適用できる", () => {
      const configTime = dayjs("2024-01-01T09:30:00");
      const targetDate = "2024-06-15";

      const result = resolveConfigTimeOnDate(configTime, targetDate);
      const resultDayjs = dayjs(result);

      expect(result).toContain("2024-06-15");
      expect(resultDayjs.hour()).toBe(9);
      expect(resultDayjs.minute()).toBe(30);
    });

    it("Dayjsオブジェクトの日付候補を受け取れる", () => {
      const configTime = dayjs("2024-01-01T14:45:00");
      const targetDate = dayjs("2024-12-25");

      const result = resolveConfigTimeOnDate(configTime, targetDate);
      const resultDayjs = dayjs(result);

      expect(result).toContain("2024-12-25");
      expect(resultDayjs.hour()).toBe(14);
      expect(resultDayjs.minute()).toBe(45);
    });

    it("設定時刻の時・分・秒・ミリ秒を正確に適用できる", () => {
      const configTime = dayjs("2024-01-01T23:59:59.999");
      const targetDate = "2024-03-15";

      const result = resolveConfigTimeOnDate(configTime, targetDate);
      const resultDayjs = dayjs(result);

      expect(resultDayjs.hour()).toBe(23);
      expect(resultDayjs.minute()).toBe(59);
      expect(resultDayjs.second()).toBe(59);
      expect(resultDayjs.millisecond()).toBe(999);
    });
  });

  describe("null/undefinedの処理", () => {
    it("日付候補がnullの場合、現在日時を使用する", () => {
      const configTime = dayjs("2024-01-01T10:00:00");
      const today = dayjs();

      const result = resolveConfigTimeOnDate(configTime, null);
      const resultDayjs = dayjs(result);

      expect(resultDayjs.format("YYYY-MM-DD")).toBe(today.format("YYYY-MM-DD"));
      expect(resultDayjs.hour()).toBe(10);
      expect(resultDayjs.minute()).toBe(0);
    });

    it("日付候補がundefinedの場合、現在日時を使用する", () => {
      const configTime = dayjs("2024-01-01T15:30:00");
      const today = dayjs();

      const result = resolveConfigTimeOnDate(configTime, undefined);
      const resultDayjs = dayjs(result);

      expect(resultDayjs.format("YYYY-MM-DD")).toBe(today.format("YYYY-MM-DD"));
      expect(resultDayjs.hour()).toBe(15);
      expect(resultDayjs.minute()).toBe(30);
    });

    it("すべての日付候補がnull/undefinedの場合、現在日時を使用する", () => {
      const configTime = dayjs("2024-01-01T08:00:00");
      const today = dayjs();

      const result = resolveConfigTimeOnDate(configTime, null, undefined, null);
      const resultDayjs = dayjs(result);

      expect(resultDayjs.format("YYYY-MM-DD")).toBe(today.format("YYYY-MM-DD"));
      expect(resultDayjs.hour()).toBe(8);
      expect(resultDayjs.minute()).toBe(0);
    });
  });

  describe("複数の日付候補", () => {
    it("複数の候補のうち最初の有効な日付を使用する", () => {
      const configTime = dayjs("2024-01-01T11:00:00");

      const result = resolveConfigTimeOnDate(
        configTime,
        null,
        undefined,
        "2024-07-20",
        "2024-08-25"
      );
      const resultDayjs = dayjs(result);

      expect(result).toContain("2024-07-20");
      expect(resultDayjs.hour()).toBe(11);
      expect(resultDayjs.minute()).toBe(0);
    });

    it("最初の候補がnullでも2番目の候補を使用できる", () => {
      const configTime = dayjs("2024-01-01T16:15:00");

      const result = resolveConfigTimeOnDate(configTime, null, "2024-09-10");
      const resultDayjs = dayjs(result);

      expect(result).toContain("2024-09-10");
      expect(resultDayjs.hour()).toBe(16);
      expect(resultDayjs.minute()).toBe(15);
    });

    it("複数の有効な候補がある場合、最初のものを優先する", () => {
      const configTime = dayjs("2024-01-01T12:30:00");

      const result = resolveConfigTimeOnDate(
        configTime,
        "2024-05-05",
        "2024-06-06",
        "2024-07-07"
      );

      expect(result).toContain("2024-05-05");
      expect(result).not.toContain("2024-06-06");
      expect(result).not.toContain("2024-07-07");
    });
  });

  describe("無効な日付文字列の処理", () => {
    it("無効な日付文字列の場合、次の候補を使用する", () => {
      const configTime = dayjs("2024-01-01T13:00:00");

      const result = resolveConfigTimeOnDate(
        configTime,
        "invalid-date",
        "2024-10-31"
      );
      const resultDayjs = dayjs(result);

      expect(result).toContain("2024-10-31");
      expect(resultDayjs.hour()).toBe(13);
      expect(resultDayjs.minute()).toBe(0);
    });

    it("すべての候補が無効な場合、現在日時を使用する", () => {
      const configTime = dayjs("2024-01-01T17:45:00");
      const today = dayjs();

      const result = resolveConfigTimeOnDate(
        configTime,
        "invalid",
        "not-a-date"
      );
      const resultDayjs = dayjs(result);

      expect(resultDayjs.format("YYYY-MM-DD")).toBe(today.format("YYYY-MM-DD"));
      expect(resultDayjs.hour()).toBe(17);
      expect(resultDayjs.minute()).toBe(45);
    });
  });

  describe("ISO形式の出力", () => {
    it("ISO 8601形式の文字列を返す", () => {
      const configTime = dayjs("2024-01-01T10:30:00");
      const targetDate = "2024-04-01";

      const result = resolveConfigTimeOnDate(configTime, targetDate);

      // ISO 8601形式のパターンにマッチすることを確認
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it("UTCタイムゾーンで出力される", () => {
      const configTime = dayjs("2024-01-01T18:00:00");
      const targetDate = "2024-11-11";

      const result = resolveConfigTimeOnDate(configTime, targetDate);

      expect(result).toMatch(/Z$/);
    });
  });
});
