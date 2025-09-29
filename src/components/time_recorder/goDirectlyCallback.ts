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

export async function goDirectlyCallback(
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
): Promise<void> {
  if (!cognitoUser) {
    logger.debug("Skipped goDirectlyCallback because cognitoUser is missing");
    return;
  }

  const attendanceStartTime = resolveStartTime(startTimeIso);

  try {
    const attendance = await clockIn(
      cognitoUser.id,
      today,
      attendanceStartTime,
      GoDirectlyFlag.YES
    );

    dispatch(setSnackbarSuccess(MESSAGE_CODE.S01003));
    new TimeRecordMailSender(cognitoUser, attendance, staff).clockIn();
  } catch (error) {
    logger.error("Failed to clock in with go directly flag", error);
    dispatch(setSnackbarError(MESSAGE_CODE.E01005));
  }
}

function resolveStartTime(startTimeIso?: string) {
  if (startTimeIso) {
    return startTimeIso;
  }

  return new AttendanceDateTime().setWorkStart().toISOString();
}
