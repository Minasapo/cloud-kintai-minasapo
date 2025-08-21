import { Dispatch } from "@reduxjs/toolkit";
import { Logger } from "aws-amplify";

import { Attendance, Staff } from "@/API";
import * as MESSAGE_CODE from "@/errors";
import { GoDirectlyFlag } from "@/hooks/useAttendance/useAttendance";
import { CognitoUser } from "@/hooks/useCognitoUser";
import { AttendanceDateTime } from "@/lib/AttendanceDateTime";
import { TimeRecordMailSender } from "@/lib/mail/TimeRecordMailSender";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

export function goDirectlyCallback(
  cognitoUser: CognitoUser | null | undefined,
  today: string,
  staff: Staff | null | undefined,
  dispatch: Dispatch,
  clockIn: (
    staffId: string,
    workDate: string,
    startTime: string,
    goDirectlyFlag?: GoDirectlyFlag
  ) => Promise<Attendance>,
  logger: Logger,
  // optional explicit ISO timestamp to use for work start (allows AppConfig-driven times)
  startTimeIso?: string
) {
  if (!cognitoUser) {
    return;
  }

  const now = startTimeIso ?? new AttendanceDateTime().setWorkStart().toISOString();

  clockIn(cognitoUser.id, today, now, GoDirectlyFlag.YES)
    .then((res) => {
      dispatch(setSnackbarSuccess(MESSAGE_CODE.S01003));
      new TimeRecordMailSender(cognitoUser, res, staff).clockIn();
    })
    .catch((e) => {
      logger.debug(e);
      dispatch(setSnackbarError(MESSAGE_CODE.E01005));
    });
}
