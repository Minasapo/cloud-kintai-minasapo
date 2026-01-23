import { Dispatch } from "@reduxjs/toolkit";
import { Attendance } from "@shared/api/graphql/types";

import { CognitoUser } from "@/hooks/useCognitoUser";
import { Logger } from "@/shared/lib/logger";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

import { getNowISOStringWithZeroSeconds } from "@/entities/attendance/lib/timeUtils";

type SnackbarMessage = Parameters<typeof setSnackbarSuccess>[0];

type AttendanceMutation = (
  staffId: string,
  workDate: string,
  isoTime: string
) => Promise<Attendance>;

export interface AttendanceMutationOptions {
  cognitoUser: CognitoUser | null | undefined;
  today: string;
  mutation: AttendanceMutation;
  dispatch: Dispatch;
  successMessage: SnackbarMessage;
  errorMessage: SnackbarMessage;
  logger: Logger;
  actionLabel?: string;
}

export function executeAttendanceMutation({
  cognitoUser,
  today,
  mutation,
  dispatch,
  successMessage,
  errorMessage,
  logger,
  actionLabel = "attendance mutation",
}: AttendanceMutationOptions) {
  if (!cognitoUser) {
    logger.warn(`[${actionLabel}] skipped because Cognito user is unavailable`);
    return;
  }

  const timestamp = getNowISOStringWithZeroSeconds();

  mutation(cognitoUser.id, today, timestamp)
    .then(() => {
      dispatch(setSnackbarSuccess(successMessage));
    })
    .catch((error) => {
      logger.error(`[${actionLabel}] failed`, error);
      dispatch(setSnackbarError(errorMessage));
    });
}
