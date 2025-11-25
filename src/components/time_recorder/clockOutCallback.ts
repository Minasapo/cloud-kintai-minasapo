/**
 * 勤怠打刻（退勤）時のコールバック関数を提供します。
 *
 * @packageDocumentation
 */

import { Dispatch } from "@reduxjs/toolkit";
import { Logger } from "aws-amplify";

import { Attendance, CreateOperationLogInput, Staff } from "@/API";
import * as MESSAGE_CODE from "@/errors";
import { ReturnDirectlyFlag } from "@/hooks/useAttendance/useAttendance";
import { CognitoUser } from "@/hooks/useCognitoUser";
import createOperationLogData from "@/hooks/useOperationLog/createOperationLogData";
import { TimeRecordMailSender } from "@/lib/mail/TimeRecordMailSender";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

import { getNowISOStringWithZeroSeconds } from "./util";

/**
 * 退勤打刻時の処理を行うコールバック関数です。
 *
 * @param cognitoUser - 現在ログイン中のCognitoユーザー情報
 * @param today - 本日の日付（YYYY-MM-DD形式）
 * @param clockOut - 退勤打刻を行う非同期関数
 * @param dispatch - Reduxのdispatch関数
 * @param staff - スタッフ情報
 * @param logger - ログ出力用Loggerインスタンス
 */
export async function clockOutCallback(
  cognitoUser: CognitoUser | null | undefined,
  today: string,
  clockOut: (
    staffId: string,
    workDate: string,
    endTime: string,
    returnDirectlyFlag?: ReturnDirectlyFlag
  ) => Promise<Attendance>,
  dispatch: Dispatch,
  staff: Staff | null | undefined,
  logger: Logger,
  endTimeIso?: string
): Promise<void> {
  if (!cognitoUser) {
    logger.debug("Skipped clockOutCallback because cognitoUser is missing");
    return;
  }

  if (!staff) {
    logger.debug("Skipped clockOutCallback because staff is missing");
    return;
  }

  const clockOutTime = resolveClockOutTime(endTimeIso);

  // capture pressed time and t0 immediately to measure processing duration
  const pressedAt = getNowISOStringWithZeroSeconds();
  const t0 = Date.now();

  try {
    const attendance = await clockOut(cognitoUser.id, today, clockOutTime);
    const t1 = Date.now();
    const processingTimeMs = t1 - t0;

    // record button-press time and include attendance time + processing time inside details (best-effort)
    try {
      const input: CreateOperationLogInput = {
        staffId: cognitoUser.id,
        action: "clock_out",
        resource: "attendance",
        resourceId: attendance?.id ?? undefined,
        // primary timestamp: when the user pressed the button
        timestamp: pressedAt,
        details: JSON.stringify({
          workDate: today,
          attendanceTime: clockOutTime,
          processingTimeMs,
          staffName: staff
            ? `${staff.familyName ?? ""} ${staff.givenName ?? ""}`.trim()
            : undefined,
        }),
        metadata: JSON.stringify({ processingTimeMs }),
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      };

      await createOperationLogData(input);
    } catch (logErr) {
      logger.error("Failed to create operation log for clockOut", logErr);
    }

    dispatch(setSnackbarSuccess(MESSAGE_CODE.S01002));
    new TimeRecordMailSender(cognitoUser, attendance, staff).clockOut();
  } catch (error) {
    logger.error("Failed to clock out", error);
    dispatch(setSnackbarError(MESSAGE_CODE.E01002));
  }
}

function resolveClockOutTime(endTimeIso?: string) {
  if (endTimeIso) {
    return endTimeIso;
  }

  return getNowISOStringWithZeroSeconds();
}
