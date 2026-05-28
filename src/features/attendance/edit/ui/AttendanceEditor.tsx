import { AuthContext } from "@app/providers/auth/AuthContext";
import useAppConfig from "@entities/app-config/model/useAppConfig";
import {
  useCreateAttendanceMutation,
  useUpdateAttendanceMutation,
} from "@entities/attendance/api/attendanceApi";
import { useOvertimeRequest } from "@entities/attendance/hooks/useOvertimeRequest";
import { collectAttendanceErrorMessages } from "@entities/attendance/validation/collectErrorMessages";
import {
  type OvertimeCheckContext,
  validateOvertimeCheck,
} from "@entities/attendance/validation/overtimeCheckValidator";
import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import AttendanceEditProvider from "@features/attendance/edit/model/AttendanceEditProvider";
import { type AttendanceEditInputs } from "@features/attendance/edit/model/common";
import { useAttendanceEditForm } from "@features/attendance/edit/model/useAttendanceEditForm";
import { useAttendanceGoDirectlyHandler } from "@features/attendance/edit/model/useAttendanceGoDirectlyHandler";
import { useAttendanceHolidayHandlers } from "@features/attendance/edit/model/useAttendanceHolidayHandlers";
import { useAttendanceSubmit } from "@features/attendance/edit/model/useAttendanceSubmit";
import { AttendanceEditorBody } from "@features/attendance/edit/ui/components/AttendanceEditorBody";
import { Logger } from "@shared/lib/logger";
import { createMonthSearchParams, MONTH_QUERY_KEY } from "@shared/lib/monthQuery";
import { ProgressBar } from "@shared/ui/feedback";
import { InlineAlert } from "@shared/ui/feedback/InlineAlert";
import { usePageLeaveGuard } from "@shared/ui/feedback/usePageLeaveGuard";
import { useCallback, useContext, useMemo, useState } from "react";
import { type UseFormWatch } from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { useAttendanceRecord } from "../model/useAttendanceRecord";
import { calcTotalHourlyPaidHolidayTime } from "./items/HourlyPaidHolidayTimeItem";
import { calcTotalRestTime } from "./items/RestTimeItem/RestTimeItem";
import { calcTotalWorkTime } from "./items/WorkTimeItem/WorkTimeItem";

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

function useOvertimeError({
  watchedEndTime,
  appConfig,
  configEndTime,
  overtimeRequestEndTime,
  hasOvertimeRequest,
}: {
  watchedEndTime?: string | null;
  appConfig: ReturnType<typeof useAppConfig>["config"];
  configEndTime: ReturnType<typeof useAppConfig>["derived"]["endTime"];
  overtimeRequestEndTime?: string | null;
  hasOvertimeRequest: boolean;
}): string | null {
  return useMemo(() => {
    if (!watchedEndTime || !appConfig) {
      return null;
    }
    const context: OvertimeCheckContext = {
      workEndTime: configEndTime.format("HH:mm"),
      overTimeCheckEnabled: appConfig.overTimeCheckEnabled ?? false,
      overtimeRequestEndTime: overtimeRequestEndTime ?? null,
      hasOvertimeRequest,
    };
    const result = validateOvertimeCheck(watchedEndTime, context);
    if (!result.isValid && result.errorMessage) {
      return result.errorMessage;
    }
    return null;
  }, [watchedEndTime, appConfig, overtimeRequestEndTime, hasOvertimeRequest, configEndTime]);
}

function useAttendanceEditorTimeSummary(watch: UseFormWatch<AttendanceEditInputs>) {
  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form's watch() is not a React hook
  const watchedEndTime = watch("endTime");
  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form's watch() is not a React hook
  const watchedStartTime = watch("startTime");
  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form's watch() is not a React hook
  const watchedRests = watch("rests");
  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form's watch() is not a React hook
  const watchedHourlyPaidHolidayTimes = watch("hourlyPaidHolidayTimes");

  const totalWorkTime = useMemo(() => {
    if (!watchedEndTime) return 0;
    return calcTotalWorkTime(watchedStartTime, watchedEndTime);
  }, [watchedStartTime, watchedEndTime]);
  const totalRestTime = useMemo(
    () =>
      watchedRests?.reduce((acc, rest) => {
        if (!rest) return acc;
        if (!rest.endTime) return acc;
        return acc + calcTotalRestTime(rest.startTime, rest.endTime);
      }, 0) ?? 0,
    [watchedRests],
  );
  const totalProductionTime = useMemo(
    () => totalWorkTime - totalRestTime,
    [totalWorkTime, totalRestTime],
  );
  const totalHourlyPaidHolidayTime = useMemo(
    () =>
      watchedHourlyPaidHolidayTimes?.reduce((acc, time) => {
        if (!time) return acc;
        if (!time.endTime) return acc;
        return acc + calcTotalHourlyPaidHolidayTime(time.startTime, time.endTime);
      }, 0) ?? 0,
    [watchedHourlyPaidHolidayTimes],
  );
  const isOnBreak = useMemo(
    () =>
      !!(
        watchedStartTime &&
        watchedRests &&
        watchedRests.length > 0 &&
        watchedRests[0]?.startTime &&
        !watchedRests[0]?.endTime
      ),
    [watchedStartTime, watchedRests],
  );

  return { watchedEndTime, totalProductionTime, totalHourlyPaidHolidayTime, isOnBreak };
}

const logger = new Logger("AttendanceEditor", import.meta.env.DEV ? "DEBUG" : "ERROR");

function useAttendanceMutations() {
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
}

type UseAttendanceEditorHandlersProps = Omit<
  Parameters<typeof useAttendanceHolidayHandlers>[0],
  "logger"
> &
  Parameters<typeof useAttendanceGoDirectlyHandler>[0] & {
    isDirty: boolean;
    isSubmitting: boolean;
  };

function useAttendanceEditorHandlers({
  getValues,
  setValue,
  getStartTime,
  getEndTime,
  getLunchRestStartTime,
  getLunchRestEndTime,
  targetWorkDate,
  attendanceWorkDate,
  workDate,
  restReplace,
  hourlyPaidHolidayTimeReplace,
  setHighlightStartTime,
  isDirty,
  isSubmitting,
}: UseAttendanceEditorHandlersProps) {
  const { handleAbsentFlagChange, handleSpecialHolidayFlagChange } =
    useAttendanceHolidayHandlers({
      getValues,
      setValue,
      getStartTime,
      getEndTime,
      getLunchRestStartTime,
      getLunchRestEndTime,
      targetWorkDate,
      attendanceWorkDate,
      workDate,
      restReplace,
      hourlyPaidHolidayTimeReplace,
      logger,
    });
  const { handleGoDirectlyChange } = useAttendanceGoDirectlyHandler({
    setValue,
    getValues,
    getStartTime,
    workDate,
    targetWorkDate,
    setHighlightStartTime,
  });
  const { dialog, runWithoutGuard } = usePageLeaveGuard({
    isDirty,
    isBusy: isSubmitting,
  });
  return { handleAbsentFlagChange, handleSpecialHolidayFlagChange, handleGoDirectlyChange, dialog, runWithoutGuard };
}


export default function AttendanceEditor({ readOnly }: { readOnly?: boolean }) {
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
    logger,
    navigateToAttendanceList: () =>
      runWithoutGuard(() => navigate(attendanceListPath)),
    setSubmitError,
    clearSubmitError,
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
    });
  if (appConfigLoading || staffsLoading || !hasAttendanceFetched) {
    return <ProgressBar />;
  }
  if (staffSError) {
    return (
      <InlineAlert tone="error" title="エラー">
        {staffSError.message}
      </InlineAlert>
    );
  }
  if (!targetStaffId) {
    return (
      <InlineAlert tone="error" title="エラー">
        スタッフが指定されていません。
      </InlineAlert>
    );
  }
  const changeRequests = attendance?.changeRequests
    ? attendance.changeRequests
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .filter((item) => !item.completed)
    : [];
  return (
    <AttendanceEditProvider
      value={{
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
        readOnly,
        isOnBreak,
      }}
    >
      <AttendanceEditorBody
        dialog={dialog}
        attendanceListPath={attendanceListPath}
        sortedHistories={sortedHistories}
        historyIndex={historyIndex}
        historiesLoading={historiesLoading}
        setHistoryIndex={setHistoryIndex}
        applyHistory={applyHistory}
        logger={logger}
        overtimeError={overtimeError}
        totalProductionTime={totalProductionTime}
        totalHourlyPaidHolidayTime={totalHourlyPaidHolidayTime}
        highlightStartTime={highlightStartTime}
        handleGoDirectlyChange={handleGoDirectlyChange}
        getAbsentEnabled={getAbsentEnabled}
        getSpecialHolidayEnabled={getSpecialHolidayEnabled}
        getHourlyPaidHolidayEnabled={getHourlyPaidHolidayEnabled}
        handleAbsentFlagChange={handleAbsentFlagChange}
        handleSpecialHolidayFlagChange={handleSpecialHolidayFlagChange}
        handleSubmit={handleSubmit}
        handleUpdateAttendance={handleUpdateAttendance}
        enabledSendMail={enabledSendMail}
        onToggleSendMail={() => setEnabledSendMail((prev) => !prev)}
      />
    </AttendanceEditProvider>
  );
}
