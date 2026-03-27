import createOperationLogData from "@entities/operation-log/model/createOperationLogData";
import fetchStaff from "@entities/staff/model/useStaff/fetchStaff";
import { Dispatch } from "@reduxjs/toolkit";
import { Attendance, CreateOperationLogInput } from "@shared/api/graphql/types";

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
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

export async function restEndCallback(
  cognitoUser: CognitoUser | null | undefined,
  restEnd: (
    staffId: string,
    workDate: string,
    endTime: string
  ) => Promise<Attendance>,
  dispatch: Dispatch,
  logger: Logger,
  occurredAt = getNowISOStringWithZeroSeconds()
): Promise<void> {
  if (!cognitoUser) {
    logger.warn("[restEnd] skipped because Cognito user is unavailable");
    return;
  }

  const workDate = resolveBusinessWorkDate(occurredAt);
  const clientTimezone = resolveClientTimeZone();
  const appVersion = resolveAppVersion();
  const idempotencyKey = buildAttendanceIdempotencyKey({
    action: "rest_end",
    staffId: cognitoUser.id,
    occurredAt,
  });

  const t0 = Date.now();

  try {
    const attendance = await restEnd(cognitoUser.id, workDate, occurredAt);
    const t1 = Date.now();
    const processingTimeMs = t1 - t0;

    dispatch(setSnackbarSuccess(MESSAGE_CODE.S01006));

    try {
      let staffName: string | undefined;
      try {
        const staff = await fetchStaff(cognitoUser.id);
        if (staff) {
          staffName = `${staff.familyName ?? ""} ${staff.givenName ?? ""}`.trim();
        }
      } catch (e) {
        logger.debug("failed to fetch staff for restEnd operation log", e);
      }

      const input: CreateOperationLogInput = {
        staffId: cognitoUser.id,
        action: "rest_end",
        resource: "attendance",
        resourceId: attendance?.id ?? undefined,
        timestamp: occurredAt,
        details: JSON.stringify({
          workDate,
          restEndTime: occurredAt,
          processingTimeMs,
          clientTimezone,
          occurredAt,
          resolvedWorkDate: workDate,
          idempotencyKey,
          appVersion,
          staffName: staffName ?? undefined,
        }),
        metadata: JSON.stringify({
          processingTimeMs,
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
      logger.error("Failed to create operation log for restEnd", logErr);
    }
  } catch (error) {
    logger.error("[restEnd] failed", error);
    dispatch(setSnackbarError(MESSAGE_CODE.E01004));
  }
}
