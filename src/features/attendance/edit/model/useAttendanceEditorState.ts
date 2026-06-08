import { AuthContext } from "@app/providers/auth/AuthContext";
import useAppConfig from "@entities/app-config/model/useAppConfig";
import { useOvertimeRequest } from "@entities/attendance/hooks/useOvertimeRequest";
import { collectAttendanceErrorMessages } from "@entities/attendance/validation/collectErrorMessages";
import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import { useAttendanceEditForm } from "@features/attendance/edit/model/useAttendanceEditForm";
import { useAttendanceSubmit } from "@features/attendance/edit/model/useAttendanceSubmit";
import { Logger } from "@shared/lib/logger";
import { createMonthSearchParams, MONTH_QUERY_KEY } from "@shared/lib/monthQuery";
import { useContext, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { useAttendanceRecord } from "../model/useAttendanceRecord";
import { useAttendanceEditorHandlers } from "./useAttendanceEditorHandlers";
import { useAttendanceEditorTimeSummary } from "./useAttendanceEditorTimeSummary";
import { useAttendanceMutations } from "./useAttendanceMutations";
import { useOvertimeError } from "./useOvertimeError";

function buildAttendanceListPath(
  searchParams: URLSearchParams,
  targetStaffId: string | undefined,
): string {
  const month = searchParams.get(MONTH_QUERY_KEY);
  const basePath = targetStaffId
    ? `/admin/staff/${targetStaffId}/attendance`
    : "/admin/attendances";
  if (!month) {
    return basePath;
  }
  return `${basePath}?${createMonthSearchParams(month).toString()}`;
}

type UseAttendanceEditorStateParams = {
  readOnly?: boolean;
};

export const useAttendanceEditorState = ({ readOnly }: UseAttendanceEditorStateParams) => {
  const {
    derived,
    loading: appConfigLoading,
    config: appConfig,
  } = useAppConfig();
  const {
    lunchRestStartTime,
    lunchRestEndTime,
    hourlyPaidHolidayEnabled,
    specialHolidayEnabled,
    startTime: configStartTime,
    endTime: configEndTime,
    absentEnabled,
  } = derived;
  const getLunchRestStartTime = () => lunchRestStartTime;
  const getLunchRestEndTime = () => lunchRestEndTime;
  const getHourlyPaidHolidayEnabled = (): boolean => hourlyPaidHolidayEnabled ?? false;
  const getSpecialHolidayEnabled = (): boolean => specialHolidayEnabled ?? false;
  const getStartTime = () => configStartTime;
  const getEndTime = () => configEndTime;
  const getAbsentEnabled = (): boolean => absentEnabled ?? false;
  const { targetWorkDate, staffId: targetStaffId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { authStatus, cognitoUser: currentUser } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { loading: staffsLoading, error: staffSError } = useStaffs({
    isAuthenticated,
  });
  const { handleUpdateAttendance, handleCreateAttendance } = useAttendanceMutations();
  const [highlightStartTime, setHighlightStartTime] = useState(false);
  const [enabledSendMail, setEnabledSendMail] = useState(true);
  const attendanceListPath = buildAttendanceListPath(searchParams, targetStaffId);
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
    restUpdate,
    restReplace,
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
  const { watchedEndTime, totalProductionTime, totalHourlyPaidHolidayTime, isOnBreak } =
    useAttendanceEditorTimeSummary(watch);
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
  const { handleAbsentFlagChange, handleSpecialHolidayFlagChange, handleGoDirectlyChange, dialog, runWithoutGuard } =
    useAttendanceEditorHandlers({
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
      logger: new Logger("AttendanceEditor", import.meta.env.DEV ? "DEBUG" : "ERROR"),
    });
  const { onSubmit } = useAttendanceSubmit({
    attendance,
    staff,
    currentUserId: currentUser?.id,
    enabledSendMail,
    handleUpdateAttendance,
    handleCreateAttendance,
    targetStaffId,
    targetWorkDate,
    getStartTime,
    getEndTime,
    attendanceListPath,
    overtimeError,
    logger: new Logger("AttendanceEditor", import.meta.env.DEV ? "DEBUG" : "ERROR"),
    navigateToAttendanceList: () =>
      runWithoutGuard(() => navigate(attendanceListPath)),
    setSubmitError,
    clearSubmitError,
  });
  const changeRequests = attendance?.changeRequests
    ? attendance.changeRequests
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .filter((item) => !item.completed)
    : [];
  return {
    appConfigLoading,
    staffsLoading,
    hasAttendanceFetched,
    staffSError,
    targetStaffId,
    staff,
    workDate,
    attendance,
    onSubmit,
    getValues,
    setValue,
    watch,
    isDirty,
    isValid,
    isSubmitting,
    submitErrorMessage,
    restFields,
    changeRequests,
    restAppend,
    restRemove,
    restUpdate,
    restReplace,
    register,
    control,
    hourlyPaidHolidayTimeFields,
    hourlyPaidHolidayTimeAppend,
    hourlyPaidHolidayTimeRemove,
    hourlyPaidHolidayTimeUpdate,
    hourlyPaidHolidayTimeReplace,
    hourlyPaidHolidayEnabled: getHourlyPaidHolidayEnabled(),
    errorMessages,
    isOnBreak,
    dialog,
    attendanceListPath,
    sortedHistories,
    historyIndex,
    historiesLoading,
    setHistoryIndex,
    applyHistory,
    overtimeError,
    totalProductionTime,
    totalHourlyPaidHolidayTime,
    highlightStartTime,
    handleGoDirectlyChange,
    getAbsentEnabled,
    getSpecialHolidayEnabled,
    getHourlyPaidHolidayEnabled,
    handleAbsentFlagChange,
    handleSpecialHolidayFlagChange,
    handleSubmit,
    handleUpdateAttendance,
    enabledSendMail,
    toggleSendMail: () => setEnabledSendMail((prev) => !prev),
  };
};