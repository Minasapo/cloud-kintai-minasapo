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

export async function restStartCallback(
  cognitoUser: CognitoUser | null | undefined,
  dispatch: Dispatch,
  restStart: (
    staffId: string,
    workDate: string,
    startTime: string
  ) => Promise<Attendance>,
  logger: Logger,
  occurredAt = getNowISOStringWithZeroSeconds()
): Promise<void> {
  if (!cognitoUser) {
    logger.warn("[restStart] skipped because Cognito user is unavailable");
    return;
  }

  const workDate = resolveBusinessWorkDate(occurredAt);

  try {
    await restStart(cognitoUser.id, workDate, occurredAt);
    dispatch(setSnackbarSuccess(MESSAGE_CODE.S01005));
  } catch (error) {
    logger.error("[restStart] failed", error);
    dispatch(setSnackbarError(MESSAGE_CODE.E01003));
  }
}
