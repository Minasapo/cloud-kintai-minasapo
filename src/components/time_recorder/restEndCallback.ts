import { Dispatch } from "@reduxjs/toolkit";
import { Logger } from "aws-amplify";

import { Attendance } from "@/API";
import * as MESSAGE_CODE from "@/errors";
import { CognitoUser } from "@/hooks/useCognitoUser";

import { executeAttendanceMutation } from "./attendanceMutation";

export function restEndCallback(
  cognitoUser: CognitoUser | null | undefined,
  today: string,
  restEnd: (
    staffId: string,
    workDate: string,
    endTime: string
  ) => Promise<Attendance>,
  dispatch: Dispatch,
  logger: Logger
) {
  executeAttendanceMutation({
    cognitoUser,
    today,
    mutation: restEnd,
    dispatch,
    successMessage: MESSAGE_CODE.S01006,
    errorMessage: MESSAGE_CODE.E01004,
    logger,
    actionLabel: "restEnd",
  });
}
