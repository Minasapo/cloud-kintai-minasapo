import { Logger } from "@shared/lib/logger";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import * as MESSAGE_CODE from "@/errors";

type UseAttendanceListErrorNotificationsParams = {
  attendancesError: unknown;
  calendarsError: unknown;
  closeDatesError: unknown;
  logger: Logger;
  dispatch: ReturnType<typeof useDispatch>;
};

export function useAttendanceListErrorNotifications({
  attendancesError,
  calendarsError,
  closeDatesError,
  logger,
  dispatch,
}: UseAttendanceListErrorNotificationsParams) {
  useEffect(() => {
    if (calendarsError) {
      logger.debug(calendarsError);
      dispatch(
        pushNotification({
          tone: "error",
          message: MESSAGE_CODE.E00001,
        }),
      );
    }
  }, [calendarsError, dispatch, logger]);

  useEffect(() => {
    if (closeDatesError) {
      logger.debug(closeDatesError);
      dispatch(
        pushNotification({
          tone: "error",
          message: MESSAGE_CODE.E00001,
        }),
      );
    }
  }, [closeDatesError, dispatch, logger]);

  useEffect(() => {
    if (attendancesError) {
      logger.debug(attendancesError);
      dispatch(
        pushNotification({
          tone: "error",
          message: MESSAGE_CODE.E02001,
        }),
      );
    }
  }, [attendancesError, dispatch, logger]);
}
