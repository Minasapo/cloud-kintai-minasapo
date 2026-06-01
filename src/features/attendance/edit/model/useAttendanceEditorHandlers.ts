import { usePageLeaveGuard } from "@shared/ui/feedback/usePageLeaveGuard";

import { type UseAttendanceEditorHandlersProps } from "./common";
import { useAttendanceGoDirectlyHandler } from "./useAttendanceGoDirectlyHandler";
import { useAttendanceHolidayHandlers } from "./useAttendanceHolidayHandlers";

/**
 * Hook to handle attendance editor event handlers.
 */
export function useAttendanceEditorHandlers({
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
  logger,
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

  return {
    handleAbsentFlagChange,
    handleSpecialHolidayFlagChange,
    handleGoDirectlyChange,
    dialog,
    runWithoutGuard,
  };
}