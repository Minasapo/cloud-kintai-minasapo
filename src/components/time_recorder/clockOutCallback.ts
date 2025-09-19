/**
 * 勤怠打刻（退勤）時のコールバック関数を提供します。
 *
 * @packageDocumentation
 */

import { Dispatch } from "@reduxjs/toolkit";
import { Logger } from "aws-amplify";

import { ReturnDirectlyFlag } from "@/hooks/useAttendance/useAttendance";
import { CognitoUser } from "@/hooks/useCognitoUser";

import { Attendance, Staff } from "../../API";
import * as MESSAGE_CODE from "../../errors";
import { TimeRecordMailSender } from "../../lib/mail/TimeRecordMailSender";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "../../lib/reducers/snackbarReducer";
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
export function clockOutCallback(
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
  logger: Logger
) {
  if (!cognitoUser || !staff) {
    return;
  }
  const now = getNowISOStringWithZeroSeconds();
  clockOut(cognitoUser.id, today, now)
    .then((res) => {
      dispatch(setSnackbarSuccess(MESSAGE_CODE.S01002));
      new TimeRecordMailSender(cognitoUser, res, staff).clockOut();
    })
    .catch((e) => {
      logger.debug(e);
      dispatch(setSnackbarError(MESSAGE_CODE.E01002));
    });
}
