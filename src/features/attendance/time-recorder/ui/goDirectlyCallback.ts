import createOperationLogData from "@entities/operation-log/model/createOperationLogData";
import { Dispatch } from "@reduxjs/toolkit";
import {
  Attendance,
  CreateOperationLogInput,
  Staff,
} from "@shared/api/graphql/types";

import { GoDirectlyFlag } from "@/entities/attendance/lib/actions/attendanceActions";
import { AttendanceDateTime } from "@/entities/attendance/lib/AttendanceDateTime";
import { resolveBusinessWorkDate } from "@/entities/attendance/lib/businessDate";
import {
  buildAttendanceIdempotencyKey,
  resolveAppVersion,
  resolveClientTimeZone,
} from "@/entities/attendance/lib/operationContext";
import { getNowISOStringWithZeroSeconds } from "@/entities/attendance/lib/time";
import * as MESSAGE_CODE from "@/errors";
import { CognitoUser } from "@/hooks/useCognitoUser";
import { Logger } from "@/shared/lib/logger";
import { TimeRecordMailSender } from "@/shared/lib/mail/TimeRecordMailSender";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

export async function goDirectlyCallback(
  cognitoUser: CognitoUser | null | undefined,
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
  startTimeIso?: string,
  occurredAt = getNowISOStringWithZeroSeconds()
): Promise<void> {
  if (!cognitoUser) {
    logger.debug("Skipped goDirectlyCallback because cognitoUser is missing");
    return;
  }

  const workDate = resolveBusinessWorkDate(occurredAt);
  const attendanceStartTime = resolveStartTime(startTimeIso);
  const idempotencyKey = buildAttendanceIdempotencyKey({
    action: "go_directly",
    staffId: cognitoUser.id,
    occurredAt,
  });
  const clientTimezone = resolveClientTimeZone();
  const appVersion = resolveAppVersion();

  try {
    const attendance = await clockIn(
      cognitoUser.id,
      workDate,
      attendanceStartTime,
      GoDirectlyFlag.YES
    );

    try {
      const input: CreateOperationLogInput = {
        staffId: cognitoUser.id,
        action: "go_directly",
        resource: "attendance",
        resourceId: attendance?.id ?? undefined,
        timestamp: occurredAt,
        details: JSON.stringify({
          workDate,
          attendanceTime: attendanceStartTime,
          clientTimezone,
          occurredAt,
          resolvedWorkDate: workDate,
          idempotencyKey,
          appVersion,
          staffName: staff
            ? `${staff.familyName ?? ""} ${staff.givenName ?? ""}`.trim()
            : undefined,
        }),
        metadata: JSON.stringify({
          clientTimezone,
          occurredAt,
          resolvedWorkDate: workDate,
          idempotencyKey,
          appVersion,
        }),
        clientTimezone,
        occurredAt,
        resolvedWorkDate: workDate,
        idempotencyKey,
        appVersion,
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      };
      await createOperationLogData(input);
    } catch (logErr) {
      logger.error("Failed to create operation log for goDirectly", logErr);
    }

    dispatch(setSnackbarSuccess(MESSAGE_CODE.S01003));
    try {
      await new TimeRecordMailSender(cognitoUser, attendance, staff).clockIn();
    } catch (mailErr) {
      logger.error("Failed to send go directly mail", mailErr);
    }
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
