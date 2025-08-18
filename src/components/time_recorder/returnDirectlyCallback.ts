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

export function returnDirectlyCallback(
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
) {
  if (!cognitoUser) {
    return;
  }

  const now = endTimeIso ?? new AttendanceDateTime().setWorkEnd().toISOString();

  clockOut(cognitoUser.id, today, now, ReturnDirectlyFlag.YES)
    .then((res) => {
      dispatch(setSnackbarSuccess(MESSAGE_CODE.S01004));
      new TimeRecordMailSender(cognitoUser, res, staff).clockOut();
    })
    .catch((e) => {
      logger.debug(e);
      dispatch(setSnackbarError(MESSAGE_CODE.E01006));
    });
}
