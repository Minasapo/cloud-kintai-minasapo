import useAppConfig from "@entities/app-config/model/useAppConfig";
import { useOvertimeRequest } from "@entities/attendance/hooks/useOvertimeRequest";
import { collectAttendanceErrorMessages } from "@entities/attendance/validation/collectErrorMessages";
import { useMemo, useState } from "react";

import { useAttendanceEditForm } from "./useAttendanceEditForm";
import { useAttendanceEditorTimeSummary } from "./useAttendanceEditorTimeSummary";
import { useAttendanceRecord } from "./useAttendanceRecord";
import { useOvertimeError } from "./useOvertimeError";

type UseAttendanceEditorValidationProps = {
  targetStaffId?: string;
  targetWorkDate?: string;
  readOnly?: boolean;
  appConfig: ReturnType<typeof useAppConfig>["config"];
  configEndTime: ReturnType<typeof useAppConfig>["derived"]["endTime"];
  isAuthenticated: boolean;
};

/**
 * Hook to manage validation and status related to the attendance editor.
 */
export function useAttendanceEditorValidation({
  targetStaffId,
  targetWorkDate,
  readOnly,
  appConfig,
  configEndTime,
  isAuthenticated,
}: UseAttendanceEditorValidationProps) {
  const [highlightStartTime, setHighlightStartTime] = useState(false);

  const {
    register,
    control,
    setValue,
    getValues,
    watch,
    handleSubmit,
    reset,
    errors,
    isDirty,
    isValid,
    isSubmitting,
    restFields,
    restRemove,
    restAppend,
    restReplace,
    restUpdate,
    hourlyPaidHolidayTimeFields,
    hourlyPaidHolidayTimeRemove,
    hourlyPaidHolidayTimeAppend,
    hourlyPaidHolidayTimeUpdate,
    hourlyPaidHolidayTimeReplace,
    submitErrorMessage,
    setSubmitError,
    clearSubmitError,
  } = useAttendanceEditForm();

  const {
    attendance,
    staff,
    workDate,
    historiesLoading,
    sortedHistories,
    historyIndex,
    setHistoryIndex,
    applyHistory,
    hasAttendanceFetched,
  } = useAttendanceRecord({
    targetStaffId,
    targetWorkDate,
    readOnly,
    setValue,
    reset,
    restReplace,
    hourlyPaidHolidayTimeReplace,
  });

  const { overtimeRequestEndTime, hasOvertimeRequest } = useOvertimeRequest({
    staffId: staff?.id ?? targetStaffId ?? null,
    workDate: workDate ? workDate.format("YYYY-MM-DD") : null,
    isAuthenticated,
  });

  const {
    watchedEndTime,
    totalProductionTime,
    totalHourlyPaidHolidayTime,
    isOnBreak,
  } = useAttendanceEditorTimeSummary(watch);

  const errorMessages = useMemo(
    () => collectAttendanceErrorMessages(errors),
    [errors],
  );

  const overtimeError = useOvertimeError({
    watchedEndTime,
    appConfig,
    configEndTime,
    overtimeRequestEndTime,
    hasOvertimeRequest,
  });

  const changeRequests = attendance?.changeRequests
    ? attendance.changeRequests
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .filter((item) => !item.completed)
    : [];

  return {
    // Form State
    register,
    control,
    setValue,
    getValues,
    watch,
    handleSubmit,
    reset,
    errors,
    isDirty,
    isValid,
    isSubmitting,
    restFields,
    restRemove,
    restAppend,
    restReplace,
    restUpdate,
    hourlyPaidHolidayTimeFields,
    hourlyPaidHolidayTimeRemove,
    hourlyPaidHolidayTimeAppend,
    hourlyPaidHolidayTimeUpdate,
    hourlyPaidHolidayTimeReplace,
    submitErrorMessage,
    setSubmitError,
    clearSubmitError,

    // Data & Status
    attendance,
    staff,
    workDate,
    historiesLoading,
    sortedHistories,
    historyIndex,
    setHistoryIndex,
    applyHistory,
    hasAttendanceFetched,
    overtimeRequestEndTime,
    hasOvertimeRequest,
    watchedEndTime,
    totalProductionTime,
    totalHourlyPaidHolidayTime,
    isOnBreak,
    errorMessages,
    overtimeError,
    changeRequests,
    highlightStartTime,
    setHighlightStartTime,
  };
}
