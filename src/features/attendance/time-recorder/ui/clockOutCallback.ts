/**
 * 勤怠打刻（退勤）時のコールバック関数を提供します。
 *
 * @packageDocumentation
 */

import createOperationLogData from "@entities/operation-log/model/createOperationLogData";
import { Dispatch } from "@reduxjs/toolkit";
import {
  Attendance,
  CreateOperationLogInput,
  Staff,
} from "@shared/api/graphql/types";

import { ReturnDirectlyFlag } from "@/entities/attendance/lib/actions/attendanceActions";
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

/**
 * 退勤打刻時の処理を行うコールバック関数です。
 *
 * @param cognitoUser - 現在ログイン中のCognitoユーザー情報
 * @param clockOut - 退勤打刻を行う非同期関数
 * @param dispatch - Reduxのdispatch関数
 * @param staff - スタッフ情報
 * @param logger - ログ出力用Loggerインスタンス
 */
export async function clockOutCallback(
  cognitoUser: CognitoUser | null | undefined,
  clockOut: (
    staffId: string,
    workDate: string,
    endTime: string,
    returnDirectlyFlag?: ReturnDirectlyFlag
  ) => Promise<Attendance>,
  dispatch: Dispatch,
  staff: Staff | null | undefined,
  logger: Logger,
  endTimeIso?: string,
  occurredAt = getNowISOStringWithZeroSeconds()
): Promise<void> {
  if (!cognitoUser) {
    logger.debug("Skipped clockOutCallback because cognitoUser is missing");
    return;
  }

  if (!staff) {
    logger.debug("Skipped clockOutCallback because staff is missing");
    return;
  }

  const workDate = resolveBusinessWorkDate(occurredAt);
  const clockOutTime = endTimeIso ?? occurredAt;
  const idempotencyKey = buildAttendanceIdempotencyKey({
    action: "clock_out",
    staffId: cognitoUser.id,
    occurredAt,
  });
  const clientTimezone = resolveClientTimeZone();
  const appVersion = resolveAppVersion();

  const t0 = Date.now();

  try {
    const attendance = await clockOut(cognitoUser.id, workDate, clockOutTime);
    const t1 = Date.now();
    const processingTimeMs = t1 - t0;

    try {
      const input: CreateOperationLogInput = {
        staffId: cognitoUser.id,
        action: "clock_out",
        resource: "attendance",
        resourceId: attendance?.id ?? undefined,
        timestamp: occurredAt,
        details: JSON.stringify({
          workDate,
          attendanceTime: clockOutTime,
          processingTimeMs,
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
      logger.error("Failed to create operation log for clockOut", logErr);
    }

    dispatch(setSnackbarSuccess(MESSAGE_CODE.S01002));
    try {
      await new TimeRecordMailSender(cognitoUser, attendance, staff).clockOut();
    } catch (mailErr) {
      logger.error("Failed to send clock out mail", mailErr);
    }
  } catch (error) {
    logger.error("Failed to clock out", error);
    dispatch(setSnackbarError(MESSAGE_CODE.E01002));
  }
}
