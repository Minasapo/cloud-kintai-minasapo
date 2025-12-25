import { CompanyHolidayCalendar } from "@shared/api/graphql/types";

import { CompanyHoliday } from "../CompanyHoliday";

describe("CompanyHoliday", () => {
  const mockCompanyHolidayCalendars: CompanyHolidayCalendar[] = [
    {
      __typename: "CompanyHolidayCalendar",
      id: "company-holiday-1",
      holidayDate: "2024-08-13",
      holidayName: "夏季休暇",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      __typename: "CompanyHolidayCalendar",
      id: "company-holiday-2",
      holidayDate: "2024-08-14",
      holidayName: "夏季休暇",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      __typename: "CompanyHolidayCalendar",
      id: "company-holiday-3",
      holidayDate: "2024-12-29",
      holidayName: "年末休暇",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
  ];

  describe("isHoliday", () => {
    it("会社休日カレンダーにある日付を休日と判定できる", () => {
      const companyHoliday = new CompanyHoliday(
        mockCompanyHolidayCalendars,
        "2024-08-13"
      );
      expect(companyHoliday.isHoliday()).toBe(true);
    });

    it("会社休日カレンダーにない日付を休日でないと判定できる", () => {
      const companyHoliday = new CompanyHoliday(
        mockCompanyHolidayCalendars,
        "2024-08-15"
      );
      expect(companyHoliday.isHoliday()).toBe(false);
    });

    it("複数の会社休日のうち該当する日付を正しく判定できる", () => {
      const companyHoliday1 = new CompanyHoliday(
        mockCompanyHolidayCalendars,
        "2024-08-14"
      );
      expect(companyHoliday1.isHoliday()).toBe(true);

      const companyHoliday2 = new CompanyHoliday(
        mockCompanyHolidayCalendars,
        "2024-12-29"
      );
      expect(companyHoliday2.isHoliday()).toBe(true);
    });

    it("空の会社休日カレンダーの場合、すべての日付を休日でないと判定できる", () => {
      const companyHoliday = new CompanyHoliday([], "2024-08-13");
      expect(companyHoliday.isHoliday()).toBe(false);
    });
  });

  describe("getHoliday", () => {
    it("会社休日カレンダーにある日付の休日情報を取得できる", () => {
      const companyHoliday = new CompanyHoliday(
        mockCompanyHolidayCalendars,
        "2024-08-13"
      );
      const holidayInfo = companyHoliday.getHoliday();

      expect(holidayInfo).toBeDefined();
      expect(holidayInfo?.holidayName).toBe("夏季休暇");
      expect(holidayInfo?.id).toBe("company-holiday-1");
    });

    it("会社休日カレンダーにない日付の場合、undefinedを返す", () => {
      const companyHoliday = new CompanyHoliday(
        mockCompanyHolidayCalendars,
        "2024-08-15"
      );
      const holidayInfo = companyHoliday.getHoliday();

      expect(holidayInfo).toBeUndefined();
    });

    it("複数の会社休日のうち該当する休日情報を正しく取得できる", () => {
      const companyHoliday1 = new CompanyHoliday(
        mockCompanyHolidayCalendars,
        "2024-08-14"
      );
      const holidayInfo1 = companyHoliday1.getHoliday();
      expect(holidayInfo1?.holidayName).toBe("夏季休暇");

      const companyHoliday2 = new CompanyHoliday(
        mockCompanyHolidayCalendars,
        "2024-12-29"
      );
      const holidayInfo2 = companyHoliday2.getHoliday();
      expect(holidayInfo2?.holidayName).toBe("年末休暇");
    });

    it("同じ名前の複数の休日がある場合、最初に一致するものを返す", () => {
      const companyHoliday = new CompanyHoliday(
        mockCompanyHolidayCalendars,
        "2024-08-13"
      );
      const holidayInfo = companyHoliday.getHoliday();

      expect(holidayInfo?.id).toBe("company-holiday-1");
      expect(holidayInfo?.holidayDate).toBe("2024-08-13");
    });
  });

  describe("convertDate", () => {
    it("ISO形式の日付をYYYY-MM-DD形式に変換できる", () => {
      const companyHoliday = new CompanyHoliday([], "2024-08-13");
      expect(companyHoliday.convertDate("2024-08-13T00:00:00.000Z")).toBe(
        "2024-08-13"
      );
    });

    it("YYYY-MM-DD形式の日付をそのまま返す", () => {
      const companyHoliday = new CompanyHoliday([], "2024-08-13");
      expect(companyHoliday.convertDate("2024-08-15")).toBe("2024-08-15");
    });

    it("タイムゾーン付きのISO形式の日付を正しく変換できる", () => {
      const companyHoliday = new CompanyHoliday([], "2024-08-13");
      expect(companyHoliday.convertDate("2024-08-15T09:30:00+09:00")).toBe(
        "2024-08-15"
      );
    });
  });
});
