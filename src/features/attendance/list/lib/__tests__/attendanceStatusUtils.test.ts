import dayjs from "dayjs";

import { AttendanceStatus } from "@/entities/attendance/lib/AttendanceState";

import { getStatus } from "../attendanceStatusUtils";

describe("attendanceStatusUtils.getStatus", () => {
  const buildStaff = (workType: "shift" | "weekday") => ({
    __typename: "Staff" as const,
    id: `staff-${workType}`,
    cognitoUserId: `cognito-${workType}`,
    mailAddress: `${workType}@example.com`,
    role: "staff",
    enabled: true,
    status: "active",
    workType,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  });

  const holidayCalendars = [
    {
      __typename: "HolidayCalendar" as const,
      id: "holiday-1",
      holidayDate: "2020-01-01",
      name: "元日",
      createdAt: "2020-01-01T00:00:00.000Z",
      updatedAt: "2020-01-01T00:00:00.000Z",
    },
  ];

  it("treats shift worker as evaluation target on holidays when attendance is missing", () => {
    const status = getStatus(
      undefined,
      buildStaff("shift"),
      holidayCalendars,
      [],
      dayjs("2020-01-01"),
    );

    expect(status).toBe(AttendanceStatus.Error);
  });

  it("keeps non-shift worker as out of scope on holidays when attendance is missing", () => {
    const status = getStatus(
      undefined,
      buildStaff("weekday"),
      holidayCalendars,
      [],
      dayjs("2020-01-01"),
    );

    expect(status).toBe(AttendanceStatus.None);
  });
});
