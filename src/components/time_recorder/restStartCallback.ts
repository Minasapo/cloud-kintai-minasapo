import { Dispatch } from "@reduxjs/toolkit";
import { Attendance, CreateOperationLogInput } from "@shared/api/graphql/types";

import * as MESSAGE_CODE from "@/errors";
import { CognitoUser } from "@/hooks/useCognitoUser";
import createOperationLogData from "@/hooks/useOperationLog/createOperationLogData";
import fetchStaff from "@entities/staff/model/useStaff/fetchStaff";
import { Logger } from "@/lib/logger";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

import { getNowISOStringWithZeroSeconds } from "./util";

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
  // replicate the pattern used in other callbacks so we can create an operation log
  if (!cognitoUser) {
    logger.warn("[restStart] skipped because Cognito user is unavailable");
    return;
  }

  const pressedAt = getNowISOStringWithZeroSeconds();
  const t0 = Date.now();

  restStart(cognitoUser.id, today, pressedAt)
    .then(async (attendance) => {
      const t1 = Date.now();
      const processingTimeMs = t1 - t0;

      dispatch(setSnackbarSuccess(MESSAGE_CODE.S01005));

      try {
        // try to resolve staff display name (best-effort)
        let staffName: string | undefined = undefined;
        try {
          const staff = await fetchStaff(cognitoUser.id);
          if (staff) {
            staffName = `${staff.familyName ?? ""} ${
              staff.givenName ?? ""
            }`.trim();
          }
        } catch (e) {
          // ignore staff fetch errors
          logger.debug("failed to fetch staff for restStart operation log", e);
        }

        const input: CreateOperationLogInput = {
          staffId: cognitoUser.id,
          action: "rest_start",
          resource: "attendance",
          resourceId: attendance?.id ?? undefined,
          timestamp: pressedAt,
          details: JSON.stringify({
            workDate: today,
            restStartTime: pressedAt,
            processingTimeMs,
            staffName: staffName ?? undefined,
          }),
          metadata: JSON.stringify({ processingTimeMs }),
          userAgent:
            typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        };

        await createOperationLogData(input);
      } catch (logErr) {
        logger.error("Failed to create operation log for restStart", logErr);
      }
    })
    .catch((error) => {
      logger.error("[restStart] failed", error);
      dispatch(setSnackbarError(MESSAGE_CODE.E01003));
    });
}
