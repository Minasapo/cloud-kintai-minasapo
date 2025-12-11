import { Dispatch } from "@reduxjs/toolkit";
import { Attendance, CreateOperationLogInput } from "@shared/api/graphql/types";
import { Logger } from "aws-amplify";

import * as MESSAGE_CODE from "@/errors";
import { CognitoUser } from "@/hooks/useCognitoUser";
import createOperationLogData from "@/hooks/useOperationLog/createOperationLogData";
import fetchStaff from "@/hooks/useStaff/fetchStaff";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

import { getNowISOStringWithZeroSeconds } from "./util";

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
  if (!cognitoUser) {
    logger.warn("[restEnd] skipped because Cognito user is unavailable");
    return;
  }

  const pressedAt = getNowISOStringWithZeroSeconds();
  const t0 = Date.now();

  restEnd(cognitoUser.id, today, pressedAt)
    .then(async (attendance) => {
      const t1 = Date.now();
      const processingTimeMs = t1 - t0;

      dispatch(setSnackbarSuccess(MESSAGE_CODE.S01006));

      try {
        let staffName: string | undefined = undefined;
        try {
          const staff = await fetchStaff(cognitoUser.id);
          if (staff) {
            staffName = `${staff.familyName ?? ""} ${
              staff.givenName ?? ""
            }`.trim();
          }
        } catch (e) {
          logger.debug("failed to fetch staff for restEnd operation log", e);
        }

        const input: CreateOperationLogInput = {
          staffId: cognitoUser.id,
          action: "rest_end",
          resource: "attendance",
          resourceId: attendance?.id ?? undefined,
          timestamp: pressedAt,
          details: JSON.stringify({
            workDate: today,
            restEndTime: pressedAt,
            processingTimeMs,
            staffName: staffName ?? undefined,
          }),
          metadata: JSON.stringify({ processingTimeMs }),
          userAgent:
            typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        };

        await createOperationLogData(input);
      } catch (logErr) {
        logger.error("Failed to create operation log for restEnd", logErr);
      }
    })
    .catch((error) => {
      logger.error("[restEnd] failed", error);
      dispatch(setSnackbarError(MESSAGE_CODE.E01004));
    });
}
