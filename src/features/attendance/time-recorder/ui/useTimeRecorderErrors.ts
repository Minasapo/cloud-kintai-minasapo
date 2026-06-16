import { Logger } from "@shared/lib/logger";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import * as MESSAGE_CODE from "@/errors";

type UseTimeRecorderErrorsParams = {
  attendanceError: unknown;
  attendancesError: unknown;
  calendarsError: unknown;
  shouldFetchAttendance: boolean;
  dispatch: ReturnType<typeof useDispatch>;
  logger: Logger;
};

export function useTimeRecorderErrors({
  attendanceError,
  attendancesError,
  calendarsError,
  shouldFetchAttendance,
  dispatch,
  logger,
}: UseTimeRecorderErrorsParams) {
  useEffect(() => {
    if (!calendarsError) return;
    logger.debug(calendarsError);
    dispatch(pushNotification({ tone: "error", message: MESSAGE_CODE.E00001 }));
  }, [calendarsError, dispatch, logger]);
  useEffect(() => {
    if (!shouldFetchAttendance || !attendanceError) return;
    dispatch(pushNotification({ tone: "error", message: MESSAGE_CODE.E01001 }));
  }, [attendanceError, dispatch, shouldFetchAttendance]);
  useEffect(() => {
    if (!shouldFetchAttendance || !attendancesError) return;
    dispatch(pushNotification({ tone: "error", message: MESSAGE_CODE.E02001 }));
  }, [attendancesError, dispatch, shouldFetchAttendance]);
}
