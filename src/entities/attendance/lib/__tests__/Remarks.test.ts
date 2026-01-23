import { Remarks } from "../Remarks";

const holidayCalendar = [
  {
    __typename: "HolidayCalendar" as const,
    id: "h1",
    holidayDate: "2024-05-01",
    name: "祝日A",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

const companyHolidayCalendar = [
  {
    __typename: "CompanyHolidayCalendar" as const,
    id: "c1",
    holidayDate: "2024-05-02",
    name: "会社休日B",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

describe("Remarks", () => {
  it("builds summary with paid holiday, substitute, calendar holidays and remarks", () => {
    const remarks = new Remarks(
      "2024-05-02",
      true,
      "メモ",
      holidayCalendar,
      companyHolidayCalendar,
      "2024-05-03"
    );

    expect(remarks.get()).toBe("有給休暇 振替休日 会社休日B メモ");
  });

  it("skips invalid substitute date and absent flags", () => {
    const remarks = new Remarks(
      "2024-05-01",
      false,
      undefined,
      holidayCalendar,
      companyHolidayCalendar,
      "not-a-date"
    );

    expect(remarks.get()).toBe("祝日A");
  });
});
