import { AuthContext } from "@app/providers/auth/AuthContext";
import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import { Logger } from "@shared/lib/logger";
import { useContext, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { buildAttendanceListPath } from "./common";
import { useAttendanceEditorActions } from "./useAttendanceEditorActions";
import { useAttendanceEditorConfig } from "./useAttendanceEditorConfig";
import { useAttendanceEditorValidation } from "./useAttendanceEditorValidation";

const logger = new Logger(
  "AttendanceEditor",
  import.meta.env.DEV ? "DEBUG" : "ERROR",
);

type UseAttendanceEditorStateParams = {
  readOnly?: boolean;
};

/**
 * Hook to manage the state of the attendance editor.
 */
export function useAttendanceEditorState({
  readOnly,
}: UseAttendanceEditorStateParams) {
  const { targetWorkDate, staffId: targetStaffId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { authStatus, cognitoUser: currentUser } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";

  const config = useAttendanceEditorConfig();
  const { loading: staffsLoading, error: staffSError } = useStaffs({
    isAuthenticated,
  });

  const [enabledSendMail, setEnabledSendMail] = useState(true);

  const validation = useAttendanceEditorValidation({
    targetStaffId,
    targetWorkDate,
    readOnly,
    appConfig: config.config,
    configEndTime: config.configEndTime,
    isAuthenticated,
  });

  const attendanceListPath = buildAttendanceListPath(
    searchParams,
    targetStaffId,
  );

  const actions = useAttendanceEditorActions({
    attendance: validation.attendance,
    staff: validation.staff,
    currentUserId: currentUser?.id,
    enabledSendMail,
    targetStaffId,
    targetWorkDate,
    getStartTime: config.getStartTime,
    getEndTime: config.getEndTime,
    navigate,
    attendanceListPath,
    overtimeError: validation.overtimeError,
    setSubmitError: validation.setSubmitError,
    clearSubmitError: validation.clearSubmitError,
    getValues: validation.getValues,
    setValue: validation.setValue,
    getLunchRestStartTime: config.getLunchRestStartTime,
    getLunchRestEndTime: config.getLunchRestEndTime,
    workDate: validation.workDate,
    restReplace: validation.restReplace,
    hourlyPaidHolidayTimeReplace: validation.hourlyPaidHolidayTimeReplace,
    setHighlightStartTime: validation.setHighlightStartTime,
    isDirty: validation.isDirty,
    isSubmitting: validation.isSubmitting,
    logger,
  });

  return {
    // Config & Loading
    appConfigLoading: config.loading,
    staffsLoading,
    hasAttendanceFetched: validation.hasAttendanceFetched,
    staffSError,
    targetStaffId,
    staff: validation.staff,
    workDate: validation.workDate,
    attendance: validation.attendance,

    // Form & Validation
    onSubmit: actions.onSubmit,
    getValues: validation.getValues,
    setValue: validation.setValue,
    watch: validation.watch,
    isDirty: validation.isDirty,
    isValid: validation.isValid,
    isSubmitting: validation.isSubmitting,
    submitErrorMessage: validation.submitErrorMessage,
    restFields: validation.restFields,
    changeRequests: validation.changeRequests,
    restAppend: validation.restAppend,
    restRemove: validation.restRemove,
    restUpdate: validation.restUpdate,
    restReplace: validation.restReplace,
    register: validation.register,
    control: validation.control,
    hourlyPaidHolidayTimeFields: validation.hourlyPaidHolidayTimeFields,
    hourlyPaidHolidayTimeAppend: validation.hourlyPaidHolidayTimeAppend,
    hourlyPaidHolidayTimeRemove: validation.hourlyPaidHolidayTimeRemove,
    hourlyPaidHolidayTimeUpdate: validation.hourlyPaidHolidayTimeUpdate,
    hourlyPaidHolidayTimeReplace: validation.hourlyPaidHolidayTimeReplace,

    // Derived Values
    hourlyPaidHolidayEnabled: config.getHourlyPaidHolidayEnabled(),
    errorMessages: validation.errorMessages,
    isOnBreak: validation.isOnBreak,
    dialog: actions.dialog,
    attendanceListPath,
    sortedHistories: validation.sortedHistories,
    historyIndex: validation.historyIndex,
    historiesLoading: validation.historiesLoading,
    setHistoryIndex: validation.setHistoryIndex,
    applyHistory: validation.applyHistory,
    overtimeError: validation.overtimeError,
    totalProductionTime: validation.totalProductionTime,
    totalHourlyPaidHolidayTime: validation.totalHourlyPaidHolidayTime,
    highlightStartTime: validation.highlightStartTime,
    handleGoDirectlyChange: actions.handleGoDirectlyChange,
    getAbsentEnabled: config.getAbsentEnabled,
    getSpecialHolidayEnabled: config.getSpecialHolidayEnabled,
    getHourlyPaidHolidayEnabled: config.getHourlyPaidHolidayEnabled,
    handleAbsentFlagChange: actions.handleAbsentFlagChange,
    handleSpecialHolidayFlagChange: actions.handleSpecialHolidayFlagChange,
    handleSubmit: validation.handleSubmit,
    handleUpdateAttendance: actions.handleUpdateAttendance,
    enabledSendMail,
    toggleSendMail: () => setEnabledSendMail((prev) => !prev),
  };
}
