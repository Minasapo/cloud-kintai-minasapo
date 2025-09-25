import { Dispatch } from "@reduxjs/toolkit";
import { Logger } from "aws-amplify";

import { Attendance } from "@/API";
import * as MESSAGE_CODE from "@/errors";
import { CognitoUser } from "@/hooks/useCognitoUser";

import { executeAttendanceMutation } from "./attendanceMutation";

export function restStartCallback(
  cognitoUser: CognitoUser | null | undefined,
  today: string,
  dispatch: Dispatch,
  restStart: (
    staffId: string,
    workDate: string,
    startTime: string
  ) => Promise<Attendance>,
  logger: Logger
) {
  executeAttendanceMutation({
    cognitoUser,
    today,
    mutation: restStart,
    dispatch,
    successMessage: MESSAGE_CODE.S01005,
    errorMessage: MESSAGE_CODE.E01003,
    logger,
    actionLabel: "restStart",
  });
}
