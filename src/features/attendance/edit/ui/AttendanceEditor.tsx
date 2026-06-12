import AttendanceEditProvider from "@features/attendance/edit/model/AttendanceEditProvider";
import { useAttendanceEditorState } from "@features/attendance/edit/model/useAttendanceEditorState";
import { AttendanceEditorBody } from "@features/attendance/edit/ui/components/AttendanceEditorBody";
import { Logger } from "@shared/lib/logger";
import { ProgressBar } from "@shared/ui/feedback";
import { InlineAlert } from "@shared/ui/feedback/InlineAlert";

const logger = new Logger("AttendanceEditor", import.meta.env.DEV ? "DEBUG" : "ERROR");

export default function AttendanceEditor({ readOnly }: { readOnly?: boolean }) {
  const state = useAttendanceEditorState({ readOnly });

  if (
    state.appConfigLoading ||
    state.staffsLoading ||
    !state.hasAttendanceFetched
  ) {
    return <ProgressBar />;
  }

  if (state.staffSError) {
    return (
      <InlineAlert tone="error" title="エラー">
        {state.staffSError.message}
      </InlineAlert>
    );
  }

  if (!state.targetStaffId) {
    return (
      <InlineAlert tone="error" title="エラー">
        スタッフが指定されていません。
      </InlineAlert>
    );
  }

  return (
    <AttendanceEditProvider
      value={{
        staff: state.staff,
        workDate: state.workDate,
        attendance: state.attendance,
        onSubmit: state.onSubmit,
        getValues: state.getValues,
        setValue: state.setValue,
        watch: state.watch,
        isDirty: state.isDirty,
        isValid: state.isValid,
        isSubmitting: state.isSubmitting,
        submitErrorMessage: state.submitErrorMessage,
        restFields: state.restFields,
        changeRequests: state.changeRequests,
        restAppend: state.restAppend,
        restRemove: state.restRemove,
        restUpdate: state.restUpdate,
        restReplace: state.restReplace,
        register: state.register,
        control: state.control,
        hourlyPaidHolidayTimeFields: state.hourlyPaidHolidayTimeFields,
        hourlyPaidHolidayTimeAppend: state.hourlyPaidHolidayTimeAppend,
        hourlyPaidHolidayTimeRemove: state.hourlyPaidHolidayTimeRemove,
        hourlyPaidHolidayTimeUpdate: state.hourlyPaidHolidayTimeUpdate,
        hourlyPaidHolidayTimeReplace: state.hourlyPaidHolidayTimeReplace,
        hourlyPaidHolidayEnabled: state.hourlyPaidHolidayEnabled,
        errorMessages: state.errorMessages,
        readOnly,
        isOnBreak: state.isOnBreak,
      }}
    >
      <AttendanceEditorBody
        dialog={state.dialog}
        attendanceListPath={state.attendanceListPath}
        sortedHistories={state.sortedHistories}
        historyIndex={state.historyIndex}
        historiesLoading={state.historiesLoading}
        setHistoryIndex={state.setHistoryIndex}
        applyHistory={state.applyHistory}
        logger={logger}
        overtimeError={state.overtimeError}
        totalProductionTime={state.totalProductionTime}
        totalHourlyPaidHolidayTime={state.totalHourlyPaidHolidayTime}
        highlightStartTime={state.highlightStartTime}
        handleGoDirectlyChange={state.handleGoDirectlyChange}
        getAbsentEnabled={state.getAbsentEnabled}
        getSpecialHolidayEnabled={state.getSpecialHolidayEnabled}
        getHourlyPaidHolidayEnabled={state.getHourlyPaidHolidayEnabled}
        handleAbsentFlagChange={state.handleAbsentFlagChange}
        handleSpecialHolidayFlagChange={state.handleSpecialHolidayFlagChange}
        handleSubmit={state.handleSubmit}
        handleUpdateAttendance={state.handleUpdateAttendance}
        enabledSendMail={state.enabledSendMail}
        onToggleSendMail={state.toggleSendMail}
      />
    </AttendanceEditProvider>
  );
}