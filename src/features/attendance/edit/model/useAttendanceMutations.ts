import { useCreateAttendanceMutation, useUpdateAttendanceMutation } from "@entities/attendance/api/attendanceApi";
import { useCallback } from "react";

export const useAttendanceMutations = () => {
  const [createAttendanceMutation] = useCreateAttendanceMutation();
  const [updateAttendanceMutation] = useUpdateAttendanceMutation();

  const handleUpdateAttendance = useCallback(
    (input: Parameters<typeof updateAttendanceMutation>[0]) =>
      updateAttendanceMutation(input).unwrap(),
    [updateAttendanceMutation],
  );

  const handleCreateAttendance = useCallback(
    (input: Parameters<typeof createAttendanceMutation>[0]) =>
      createAttendanceMutation(input).unwrap(),
    [createAttendanceMutation],
  );

  return { handleUpdateAttendance, handleCreateAttendance };
};