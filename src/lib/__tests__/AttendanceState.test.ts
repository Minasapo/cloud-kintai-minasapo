import dayjs, { Dayjs } from "dayjs";

import { Attendance, Staff } from "../../API";
import { AttendanceState, AttendanceStatus } from "../AttendanceState";

describe("AttendanceState", () => {
  const setMockToday = (state: AttendanceState, date: string) => {
    (state as unknown as { today: Dayjs }).today = dayjs(date);
  };

  const baseStaff: Staff = {
    __typename: "Staff",
    id: "staff-1",
    cognitoUserId: "cognito-1",
    mailAddress: "staff@example.com",
    role: "staff",
    enabled: true,
    status: "active",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  const baseAttendance: Attendance = {
    __typename: "Attendance",
    id: "attendance-1",
    staffId: baseStaff.id,
    workDate: "2024-01-01",
    startTime: "09:00",
    endTime: "18:00",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  const buildState = (
    attendanceOverrides: Partial<Attendance> = {},
    staffOverrides: Partial<Staff> = {}
  ) => {
    const staff: Staff = {
      ...baseStaff,
      ...staffOverrides,
    };

    const attendance: Attendance = {
      ...baseAttendance,
      ...attendanceOverrides,
    };

    return new AttendanceState(staff, attendance, [], []);
  };

  it("returns None when the work date is today", () => {
    const today = "2024-01-05";
    const state = buildState({ workDate: today });

    setMockToday(state, today);

    expect(state.get()).toBe(AttendanceStatus.None);
  });

  it("keeps weekday error evaluation for past dates", () => {
    const today = "2024-01-05";
    const pastDate = "2024-01-04";
    const state = buildState({ workDate: pastDate, startTime: undefined });

    setMockToday(state, today);

    expect(state.get()).toBe(AttendanceStatus.Error);
  });
});
