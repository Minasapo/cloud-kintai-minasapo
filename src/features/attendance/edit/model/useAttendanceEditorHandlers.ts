import { useAttendanceGoDirectlyHandler } from "@features/attendance/edit/model/useAttendanceGoDirectlyHandler";
import { useAttendanceHolidayHandlers } from "@features/attendance/edit/model/useAttendanceHolidayHandlers";
import { Logger } from "@shared/lib/logger";
import { usePageLeaveGuard } from "@shared/ui/feedback/usePageLeaveGuard";

type UseAttendanceEditorHandlersProps = Omit<
  Parameters<typeof useAttendanceHolidayHandlers>[0],
  "logger"
> &
  Parameters<typeof useAttendanceGoDirectlyHandler>[0] & {
    isDirty: boolean;
    isSubmitting: boolean;
    logger: Logger;
  };

export const useAttendanceEditorHandlers = ({
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
}: UseAttendanceEditorHandlersProps) => {
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
};