import { createLogger } from "@shared/lib/logger";
import { useAppNotification } from "@shared/lib/useAppNotification";
import React from "react";

import * as MESSAGE_CODE from "@/errors";

const logger = createLogger("ShiftManagementBoard");

type NotifyFn = ReturnType<typeof useAppNotification>["notify"];

type UseHolidayCalendarErrorNotificationParams = {
  calendarsError: unknown;
  notify: NotifyFn;
};

export function useHolidayCalendarErrorNotification({
  calendarsError,
  notify,
}: UseHolidayCalendarErrorNotificationParams) {
  React.useEffect(() => {
    if (calendarsError) {
      logger.error(calendarsError);
      notify({
        title: "エラー",
        description: MESSAGE_CODE.E00001,
        tone: "error",
        dedupeKey: "holiday-load-error",
      });
    }
  }, [calendarsError, notify]);
}
