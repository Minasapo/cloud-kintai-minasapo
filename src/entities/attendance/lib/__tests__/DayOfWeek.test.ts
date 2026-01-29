import { HolidayCalendar } from "@shared/api/graphql/types";

import { DayOfWeek, DayOfWeekString } from "../DayOfWeek";

describe("DayOfWeek", () => {
  // モックの祝日カレンダーデータ
  const mockHolidayCalendars: HolidayCalendar[] = [
    {
      __typename: "HolidayCalendar",
      id: "holiday-1",
      holidayDate: "2024-01-01", // 元日
      name: "元日",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      __typename: "HolidayCalendar",
      id: "holiday-2",
      holidayDate: "2024-01-08", // 成人の日（月曜日）
      name: "成人の日",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
  ];

  describe("getLabel", () => {
    it("日曜日を正しく判定できる", () => {
      const dayOfWeek = new DayOfWeek([]);
      // 2024-01-07 は日曜日
      expect(dayOfWeek.getLabel("2024-01-07")).toBe(DayOfWeekString.Sun);
    });

    it("月曜日を正しく判定できる", () => {
      const dayOfWeek = new DayOfWeek([]);
      // 2024-01-01 は月曜日（祝日だが、祝日カレンダーが空なので月曜日として判定）
      expect(dayOfWeek.getLabel("2024-01-01")).toBe(DayOfWeekString.Mon);
    });

    it("火曜日を正しく判定できる", () => {
      const dayOfWeek = new DayOfWeek([]);
      // 2024-01-02 は火曜日
      expect(dayOfWeek.getLabel("2024-01-02")).toBe(DayOfWeekString.Tue);
    });

    it("水曜日を正しく判定できる", () => {
      const dayOfWeek = new DayOfWeek([]);
      // 2024-01-03 は水曜日
      expect(dayOfWeek.getLabel("2024-01-03")).toBe(DayOfWeekString.Wed);
    });

    it("木曜日を正しく判定できる", () => {
      const dayOfWeek = new DayOfWeek([]);
      // 2024-01-04 は木曜日
      expect(dayOfWeek.getLabel("2024-01-04")).toBe(DayOfWeekString.Thu);
    });

    it("金曜日を正しく判定できる", () => {
      const dayOfWeek = new DayOfWeek([]);
      // 2024-01-05 は金曜日
      expect(dayOfWeek.getLabel("2024-01-05")).toBe(DayOfWeekString.Fri);
    });

    it("土曜日を正しく判定できる", () => {
      const dayOfWeek = new DayOfWeek([]);
      // 2024-01-06 は土曜日
      expect(dayOfWeek.getLabel("2024-01-06")).toBe(DayOfWeekString.Sat);
    });

    it("祝日を正しく判定できる", () => {
      const dayOfWeek = new DayOfWeek(mockHolidayCalendars);
      // 2024-01-01 は元日（祝日）
      expect(dayOfWeek.getLabel("2024-01-01")).toBe(DayOfWeekString.Holiday);
    });

    it("月曜日の祝日を正しく祝日と判定できる", () => {
      const dayOfWeek = new DayOfWeek(mockHolidayCalendars);
      // 2024-01-08 は成人の日（月曜日の祝日）
      expect(dayOfWeek.getLabel("2024-01-08")).toBe(DayOfWeekString.Holiday);
    });
  });

  describe("isWeekday", () => {
    it("月曜日を平日と判定できる", () => {
      const dayOfWeek = new DayOfWeek([]);
      // 2024-01-01 は月曜日
      expect(dayOfWeek.isWeekday("2024-01-01")).toBe(true);
    });

    it("火曜日を平日と判定できる", () => {
      const dayOfWeek = new DayOfWeek([]);
      // 2024-01-02 は火曜日
      expect(dayOfWeek.isWeekday("2024-01-02")).toBe(true);
    });

    it("水曜日を平日と判定できる", () => {
      const dayOfWeek = new DayOfWeek([]);
      // 2024-01-03 は水曜日
      expect(dayOfWeek.isWeekday("2024-01-03")).toBe(true);
    });

    it("木曜日を平日と判定できる", () => {
      const dayOfWeek = new DayOfWeek([]);
      // 2024-01-04 は木曜日
      expect(dayOfWeek.isWeekday("2024-01-04")).toBe(true);
    });

    it("金曜日を平日と判定できる", () => {
      const dayOfWeek = new DayOfWeek([]);
      // 2024-01-05 は金曜日
      expect(dayOfWeek.isWeekday("2024-01-05")).toBe(true);
    });

    it("土曜日を平日でないと判定できる", () => {
      const dayOfWeek = new DayOfWeek([]);
      // 2024-01-06 は土曜日
      expect(dayOfWeek.isWeekday("2024-01-06")).toBe(false);
    });

    it("日曜日を平日でないと判定できる", () => {
      const dayOfWeek = new DayOfWeek([]);
      // 2024-01-07 は日曜日
      expect(dayOfWeek.isWeekday("2024-01-07")).toBe(false);
    });

    it("祝日を平日でないと判定できる", () => {
      const dayOfWeek = new DayOfWeek(mockHolidayCalendars);
      // 2024-01-01 は元日（祝日）
      expect(dayOfWeek.isWeekday("2024-01-01")).toBe(false);
    });

    it("月曜日の祝日を平日でないと判定できる", () => {
      const dayOfWeek = new DayOfWeek(mockHolidayCalendars);
      // 2024-01-08 は成人の日（月曜日の祝日）
      expect(dayOfWeek.isWeekday("2024-01-08")).toBe(false);
    });

    it("祝日カレンダーにない月曜日を平日と判定できる", () => {
      const dayOfWeek = new DayOfWeek(mockHolidayCalendars);
      // 2024-01-15 は月曜日（祝日ではない）
      expect(dayOfWeek.isWeekday("2024-01-15")).toBe(true);
    });
  });
});
