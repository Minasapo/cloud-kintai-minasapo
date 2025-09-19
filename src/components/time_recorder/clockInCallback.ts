/**
 * @file clockInCallback.ts
 * @description 出勤打刻時のコールバック処理を提供するユーティリティ。
 * Reduxのdispatchやユーザー情報、スタッフ情報を受け取り、打刻処理・メール送信・スナックバー表示を行う。
 */

import { Dispatch } from "@reduxjs/toolkit";

import { CognitoUser } from "@/hooks/useCognitoUser";

import { Staff } from "../../API";
import * as MESSAGE_CODE from "../../errors";
import { TimeRecordMailSender } from "../../lib/mail/TimeRecordMailSender";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "../../lib/reducers/snackbarReducer";
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
export function clockInCallback(
  cognitoUser: CognitoUser | null | undefined,
  today: string,
  clockIn: (
    userId: string,
    today: string,
    now: string
  ) => Promise<import("../../API").Attendance>,
  dispatch: Dispatch,
  staff: Staff | null | undefined,
  logger: { debug: (e: unknown) => void }
) {
  if (!cognitoUser || !staff) {
    return;
  }

  const now = getNowISOStringWithZeroSeconds();
  clockIn(cognitoUser.id, today, now)
    .then((res) => {
      dispatch(setSnackbarSuccess(MESSAGE_CODE.S01001));
      new TimeRecordMailSender(cognitoUser, res, staff).clockIn();
    })
    .catch((e) => {
      logger.debug(e);
      dispatch(setSnackbarError(MESSAGE_CODE.E01001));
    });
}
