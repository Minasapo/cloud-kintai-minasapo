import { Dispatch } from "@reduxjs/toolkit";
import {
  Attendance,
  CreateOperationLogInput,
  Staff,
} from "@shared/api/graphql/types";
import { Logger } from "aws-amplify";

import * as MESSAGE_CODE from "@/errors";
import { CognitoUser } from "@/hooks/useCognitoUser";
import createOperationLogData from "@/hooks/useOperationLog/createOperationLogData";
import { GoDirectlyFlag } from "@/lib/attendance/attendanceActions";
import { AttendanceDateTime } from "@/lib/AttendanceDateTime";
import { TimeRecordMailSender } from "@/lib/mail/TimeRecordMailSender";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

import { getNowISOStringWithZeroSeconds } from "./util";

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

    // record button-press time and include attendance time inside details (best-effort)
    try {
      const pressedAt = getNowISOStringWithZeroSeconds();
      const input: CreateOperationLogInput = {
        staffId: cognitoUser.id,
        action: "go_directly",
        resource: "attendance",
        resourceId: attendance?.id ?? undefined,
        // primary timestamp: when the user pressed the button
        timestamp: pressedAt,
        details: JSON.stringify({
          workDate: today,
          attendanceTime: attendanceStartTime,
          staffName: staff
            ? `${staff.familyName ?? ""} ${staff.givenName ?? ""}`.trim()
            : undefined,
        }),
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      };
      await createOperationLogData(input);
    } catch (logErr) {
      logger.error("Failed to create operation log for goDirectly", logErr);
    }

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
