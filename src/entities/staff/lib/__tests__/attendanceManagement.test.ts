import { Staff } from "@shared/api/graphql/types";

import {
  isAttendanceManagementEnabled,
  normalizeAttendanceManagementEnabled,
} from "../attendanceManagement";

describe("attendanceManagement", () => {
  const baseStaff: Staff = {
    __typename: "Staff",
    id: "staff-1",
    cognitoUserId: "cognito-1",
    mailAddress: "staff@example.com",
    role: "Staff",
    enabled: true,
    status: "CONFIRMED",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  it("returns false only when attendance management is explicitly disabled", () => {
    expect(
      isAttendanceManagementEnabled({
        ...baseStaff,
        attendanceManagementEnabled: false,
      }),
    ).toBe(false);
  });

  it("treats null and undefined as enabled", () => {
    expect(
      isAttendanceManagementEnabled({
        ...baseStaff,
        attendanceManagementEnabled: null,
      }),
    ).toBe(true);
    expect(isAttendanceManagementEnabled(baseStaff)).toBe(true);
  });

  it("normalizes unset values to true", () => {
    expect(normalizeAttendanceManagementEnabled(baseStaff)).toMatchObject({
      attendanceManagementEnabled: true,
    });
    expect(
      normalizeAttendanceManagementEnabled({
        ...baseStaff,
        attendanceManagementEnabled: false,
      }),
    ).toMatchObject({
      attendanceManagementEnabled: false,
    });
  });
});
