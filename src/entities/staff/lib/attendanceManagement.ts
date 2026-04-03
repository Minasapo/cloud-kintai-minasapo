import { Staff } from "@shared/api/graphql/types";

type StaffWithAttendanceManagement = Pick<Staff, "attendanceManagementEnabled">;

export function isAttendanceManagementEnabled(
  staff: StaffWithAttendanceManagement | null | undefined,
) {
  return staff?.attendanceManagementEnabled !== false;
}

export function normalizeAttendanceManagementEnabled<T extends Staff>(
  staff: T,
): T & { attendanceManagementEnabled: boolean } {
  return {
    ...staff,
    attendanceManagementEnabled: isAttendanceManagementEnabled(staff),
  };
}
