import createOperationLogData from "@entities/operation-log/model/createOperationLogData";
import { Dispatch } from "@reduxjs/toolkit";
import {
  Attendance,
  CreateOperationLogInput,
  Staff,
} from "@shared/api/graphql/types";

import { ReturnDirectlyFlag } from "@/entities/attendance/lib/actions/attendanceActions";
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

export async function returnDirectlyCallback(
  cognitoUser: CognitoUser | null | undefined,
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
  endTimeIso?: string,
  occurredAt = getNowISOStringWithZeroSeconds()
): Promise<void> {
  if (!cognitoUser) {
    return;
  }

  const workDate = resolveBusinessWorkDate(occurredAt);
  const workEndTime =
    endTimeIso ?? new AttendanceDateTime().setWorkEnd().toISOString();
  const idempotencyKey = buildAttendanceIdempotencyKey({
    action: "return_directly",
    staffId: cognitoUser.id,
    occurredAt,
  });
  const clientTimezone = resolveClientTimeZone();
  const appVersion = resolveAppVersion();

  try {
    const attendance = await clockOut(
      cognitoUser.id,
      workDate,
      workEndTime,
      ReturnDirectlyFlag.YES
    );
    try {
      const input: CreateOperationLogInput = {
        staffId: cognitoUser.id,
        action: "return_directly",
        resource: "attendance",
        resourceId: attendance?.id ?? undefined,
        timestamp: occurredAt,
        details: JSON.stringify({
          workDate,
          attendanceTime: workEndTime,
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
