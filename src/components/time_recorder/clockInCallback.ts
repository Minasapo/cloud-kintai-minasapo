/**
 * @file clockInCallback.ts
 * @description 出勤打刻時のコールバック処理を提供するユーティリティ。
 * Reduxのdispatchやユーザー情報、スタッフ情報を受け取り、打刻処理・メール送信・スナックバー表示を行う。
 */

import { Dispatch } from "@reduxjs/toolkit";
import { Logger } from "aws-amplify";

import { Attendance, Staff } from "@/API";
import * as MESSAGE_CODE from "@/errors";
import { CognitoUser } from "@/hooks/useCognitoUser";
import { TimeRecordMailSender } from "@/lib/mail/TimeRecordMailSender";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

import { getNowISOStringWithZeroSeconds } from "./util";

/**
 * 出勤打刻時のコールバック関数。
 *
 * @param cognitoUser - 現在のCognitoユーザー情報
 * @param today - 本日の日付（YYYY-MM-DD形式）
 * @param clockIn - 出勤打刻を行う非同期関数
 * @param dispatch - Reduxのdispatch関数
 * @param staff - スタッフ情報
 * @param logger - デバッグ用ロガー
 */
export async function clockInCallback(
  cognitoUser: CognitoUser | null | undefined,
  today: string,
  clockIn: (
    staffId: string,
    workDate: string,
    startTime: string
  ) => Promise<Attendance>,
  dispatch: Dispatch,
  staff: Staff | null | undefined,
  logger: Logger
): Promise<void> {
  if (!cognitoUser) {
    logger.debug("Skipped clockInCallback because cognitoUser is missing");
    return;
  }

  if (!staff) {
    logger.debug("Skipped clockInCallback because staff is missing");
    return;
  }

  const startTimeIso = resolveClockInTime();

  try {
    const attendance = await clockIn(cognitoUser.id, today, startTimeIso);

    dispatch(setSnackbarSuccess(MESSAGE_CODE.S01001));
    new TimeRecordMailSender(cognitoUser, attendance, staff).clockIn();
  } catch (error) {
    logger.error("Failed to clock in", error);
    dispatch(setSnackbarError(MESSAGE_CODE.E01001));
  }
}

function resolveClockInTime() {
  return getNowISOStringWithZeroSeconds();
}
