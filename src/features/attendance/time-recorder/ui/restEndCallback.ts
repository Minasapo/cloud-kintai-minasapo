import { Dispatch } from "@reduxjs/toolkit";
import { Attendance } from "@shared/api/graphql/types";

import { resolveBusinessWorkDate } from "@/entities/attendance/lib/businessDate";
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

  try {
    await restEnd(cognitoUser.id, workDate, occurredAt);
    dispatch(setSnackbarSuccess(MESSAGE_CODE.S01006));
  } catch (error) {
    logger.error("[restEnd] failed", error);
    dispatch(setSnackbarError(MESSAGE_CODE.E01004));
  }
}
