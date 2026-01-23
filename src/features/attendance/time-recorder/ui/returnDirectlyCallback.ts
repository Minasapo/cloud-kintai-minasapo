import { Dispatch } from "@reduxjs/toolkit";
import {
  Attendance,
  CreateOperationLogInput,
  Staff,
} from "@shared/api/graphql/types";

import * as MESSAGE_CODE from "@/errors";
import { CognitoUser } from "@/hooks/useCognitoUser";
import createOperationLogData from "@entities/operation-log/model/createOperationLogData";
import { ReturnDirectlyFlag } from "@/entities/attendance/lib/attendance/attendanceActions";
import { AttendanceDateTime } from "@/entities/attendance/lib/AttendanceDateTime";
import { Logger } from "@/shared/lib/logger";
import { TimeRecordMailSender } from "@/lib/mail/TimeRecordMailSender";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

import { getNowISOStringWithZeroSeconds } from "../lib/util";

export async function returnDirectlyCallback(
  cognitoUser: CognitoUser | null | undefined,
  today: string,
  staff: Staff | null | undefined,
  dispatch: Dispatch,
  clockOut: (
    staffId: string,
    workDate: string,
    endTime: string,
    returnDirectlyFlag?: ReturnDirectlyFlag
  ) => Promise<Attendance>,
  logger: Logger,
  // optional explicit ISO timestamp to use for work end (allows AppConfig-driven times)
  endTimeIso?: string
): Promise<void> {
  if (!cognitoUser) {
    return;
  }

  const workEndTime =
    endTimeIso ?? new AttendanceDateTime().setWorkEnd().toISOString();

  try {
    const attendance = await clockOut(
      cognitoUser.id,
      today,
      workEndTime,
      ReturnDirectlyFlag.YES
    );
    try {
      const pressedAt = getNowISOStringWithZeroSeconds();
      const input: CreateOperationLogInput = {
        staffId: cognitoUser.id,
        action: "return_directly",
        resource: "attendance",
        resourceId: attendance?.id ?? undefined,
        // primary timestamp: when the user pressed the button
        timestamp: pressedAt,
        details: JSON.stringify({
          workDate: today,
          attendanceTime: workEndTime,
          staffName: staff
            ? `${staff.familyName ?? ""} ${staff.givenName ?? ""}`.trim()
            : undefined,
        }),
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      };

      await createOperationLogData(input);
    } catch (logErr) {
      logger.error("Failed to create operation log for returnDirectly", logErr);
    }

    dispatch(setSnackbarSuccess(MESSAGE_CODE.S01004));
    try {
      await new TimeRecordMailSender(cognitoUser, attendance, staff).clockOut();
    } catch (mailErr) {
      logger.error("Failed to send return directly mail", mailErr);
    }
  } catch (error) {
    logger.debug(error);
    dispatch(setSnackbarError(MESSAGE_CODE.E01006));
  }
}
