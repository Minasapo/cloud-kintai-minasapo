/**
 * @file clockInCallback.ts
 * @description 出勤打刻時のコールバック処理を提供するユーティリティ。
 * Reduxのdispatchやユーザー情報、スタッフ情報を受け取り、打刻処理・メール送信・スナックバー表示を行う。
 */

import createOperationLogData from "@entities/operation-log/model/createOperationLogData";
import { Dispatch } from "@reduxjs/toolkit";
import {
  Attendance,
  CreateOperationLogInput,
  Staff,
} from "@shared/api/graphql/types";

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
 * 出勤打刻時のコールバック関数。
 *
 * @param cognitoUser - 現在のCognitoユーザー情報
 * @param clockIn - 出勤打刻を行う非同期関数
 * @param dispatch - Reduxのdispatch関数
 * @param staff - スタッフ情報
 * @param logger - デバッグ用ロガー
 * @param occurredAt - 打刻発生時刻（ISO）
 */
export async function clockInCallback(
  cognitoUser: CognitoUser | null | undefined,
  clockIn: (
    staffId: string,
    workDate: string,
    startTime: string
  ) => Promise<Attendance>,
  dispatch: Dispatch,
  staff: Staff | null | undefined,
  logger: Logger,
  occurredAt = getNowISOStringWithZeroSeconds()
): Promise<void> {
  if (!cognitoUser) {
    logger.debug("Skipped clockInCallback because cognitoUser is missing");
    return;
  }

  if (!staff) {
    logger.debug("Skipped clockInCallback because staff is missing");
    return;
  }

  const workDate = resolveBusinessWorkDate(occurredAt);
  const startTimeIso = occurredAt;
  const idempotencyKey = buildAttendanceIdempotencyKey({
    action: "clock_in",
    staffId: cognitoUser.id,
    occurredAt,
  });
  const clientTimezone = resolveClientTimeZone();
  const appVersion = resolveAppVersion();

  const t0 = Date.now();

  try {
    const attendance = await clockIn(cognitoUser.id, workDate, startTimeIso);
    const t1 = Date.now();
    const processingTimeMs = t1 - t0;

    try {
      const input: CreateOperationLogInput = {
        staffId: cognitoUser.id,
        action: "clock_in",
        resource: "attendance",
        resourceId: attendance?.id ?? undefined,
        timestamp: occurredAt,
        details: JSON.stringify({
          workDate,
          attendanceTime: startTimeIso,
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
      logger.error("Failed to create operation log for clockIn", logErr);
    }

    dispatch(setSnackbarSuccess(MESSAGE_CODE.S01001));
    try {
      await new TimeRecordMailSender(cognitoUser, attendance, staff).clockIn();
    } catch (mailErr) {
      logger.error("Failed to send clock in mail", mailErr);
    }
  } catch (error) {
    logger.error("Failed to clock in", error);
    dispatch(setSnackbarError(MESSAGE_CODE.E01001));
  }
}
