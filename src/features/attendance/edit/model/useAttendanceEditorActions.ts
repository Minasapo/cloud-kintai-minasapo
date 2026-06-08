import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { Attendance } from "@shared/api/graphql/types";
import { Logger } from "@shared/lib/logger";
import { Dayjs } from "dayjs";
import type { Dispatch, SetStateAction } from "react";
import type { UseFieldArrayReplace } from "react-hook-form";
import type { NavigateFunction } from "react-router-dom";

import { AttendanceEditInputs } from "./common";
import { AttendanceGetValues, AttendanceSetValue } from "./types";
import { useAttendanceEditorHandlers } from "./useAttendanceEditorHandlers";
import { useAttendanceMutations } from "./useAttendanceMutations";
import { useAttendanceSubmit } from "./useAttendanceSubmit";

type UseAttendanceEditorActionsProps = {
  attendance: Attendance | null;
  staff: StaffType | null | undefined;
  currentUserId?: string | null;
  enabledSendMail: boolean;
  targetStaffId?: string;
  targetWorkDate?: string;
  getStartTime: () => Dayjs;
  getEndTime: () => Dayjs;
  navigate: NavigateFunction;
  attendanceListPath: string;
  overtimeError: string | null;
  setSubmitError: (message: string) => void;
  clearSubmitError: () => void;
  getValues: AttendanceGetValues;
  setValue: AttendanceSetValue;
  getLunchRestStartTime: () => Dayjs;
  getLunchRestEndTime: () => Dayjs;
  workDate: Dayjs | null;
  restReplace: UseFieldArrayReplace<AttendanceEditInputs, "rests">;
  hourlyPaidHolidayTimeReplace: UseFieldArrayReplace<
    AttendanceEditInputs,
    "hourlyPaidHolidayTimes"
  >;
  setHighlightStartTime: Dispatch<SetStateAction<boolean>>;
  isDirty: boolean;
  isSubmitting: boolean;
  logger: Logger;
};

/**
 * Hook to manage actions and handlers for the attendance editor.
 */
export function useAttendanceEditorActions({
  attendance,
  staff,
  currentUserId,
  enabledSendMail,
  targetStaffId,
  targetWorkDate,
  getStartTime,
  getEndTime,
  navigate,
  attendanceListPath,
  overtimeError,
  setSubmitError,
  clearSubmitError,
  getValues,
  setValue,
  getLunchRestStartTime,
  getLunchRestEndTime,
  workDate,
  restReplace,
  hourlyPaidHolidayTimeReplace,
  setHighlightStartTime,
  isDirty,
  isSubmitting,
  logger,
}: UseAttendanceEditorActionsProps) {
  const { handleUpdateAttendance, handleCreateAttendance } =
    useAttendanceMutations();

  const {
    handleAbsentFlagChange,
    handleSpecialHolidayFlagChange,
    handleGoDirectlyChange,
    dialog,
    runWithoutGuard,
  } = useAttendanceEditorHandlers({
    getValues,
    setValue,
    getStartTime,
    getEndTime,
    getLunchRestStartTime,
    getLunchRestEndTime,
    targetWorkDate,
    attendanceWorkDate: attendance?.workDate,
    workDate,
    restReplace,
    hourlyPaidHolidayTimeReplace,
    setHighlightStartTime,
    isDirty,
    isSubmitting,
    logger,
  });

  const { onSubmit } = useAttendanceSubmit({
    attendance,
    staff,
    currentUserId,
    enabledSendMail,
    handleUpdateAttendance,
    handleCreateAttendance,
    targetStaffId,
    targetWorkDate,
    getStartTime,
    getEndTime,
    attendanceListPath,
    overtimeError,
    logger,
    navigateToAttendanceList: () => runWithoutGuard(() => navigate(attendanceListPath)),
    setSubmitError,
    clearSubmitError,
  });

  return {
    onSubmit,
    handleUpdateAttendance,
    handleCreateAttendance,
    handleAbsentFlagChange,
    handleSpecialHolidayFlagChange,
    handleGoDirectlyChange,
    dialog,
    runWithoutGuard,
  };
}