import { Dispatch } from "@reduxjs/toolkit";
import { Logger } from "aws-amplify";

import { Attendance, Staff } from "@/API";
import * as MESSAGE_CODE from "@/errors";
import { ReturnDirectlyFlag } from "@/hooks/useAttendance/useAttendance";
import { CognitoUser } from "@/hooks/useCognitoUser";
import { AttendanceDateTime } from "@/lib/AttendanceDateTime";
import { TimeRecordMailSender } from "@/lib/mail/TimeRecordMailSender";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

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
    dispatch(setSnackbarSuccess(MESSAGE_CODE.S01004));
    new TimeRecordMailSender(cognitoUser, attendance, staff).clockOut();
  } catch (error) {
    logger.debug(error);
    dispatch(setSnackbarError(MESSAGE_CODE.E01006));
  }
}
