import {
  useCreateAttendanceMutation,
  useLazyGetAttendanceByStaffAndDateQuery,
  useUpdateAttendanceMutation,
} from "@entities/attendance/api/attendanceApi";
import {
  OfficeQrRegisterPanel,
  validateOfficeQrToken,
} from "@features/attendance/office-qr-register";
import {
  Attendance,
  CreateAttendanceInput,
  UpdateAttendanceInput,
} from "@shared/api/graphql/types";
import { Logger } from "aws-amplify";
import dayjs from "dayjs";
import React, { useContext, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { getNowISOStringWithZeroSeconds } from "@/components/time_recorder/util";
import { AuthContext } from "@/context/AuthContext";
import createOperationLogData from "@/hooks/useOperationLog/createOperationLogData";
import {
  clockInAction,
  clockOutAction,
} from "@/lib/attendance/attendanceActions";
import { AttendanceDate } from "@/lib/AttendanceDate";

import { useAppDispatchV2 } from "../../../app/hooks";
import { AppConfigContext } from "../../../context/AppConfigContext";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "../../../lib/reducers/snackbarReducer";

const OfficeQRRegister: React.FC = () => {
  const dispatch = useAppDispatchV2();
  const logger = React.useMemo(
    () => new Logger("RegisterPage", import.meta.env.DEV ? "DEBUG" : "ERROR"),
    []
  );
  const { getOfficeMode } = useContext(AppConfigContext);
  const { cognitoUser } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const [isOfficeModeEnabled, setIsOfficeModeEnabled] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [triggerGetAttendance] = useLazyGetAttendanceByStaffAndDateQuery();
  const [createAttendanceMutation] = useCreateAttendanceMutation();
  const [updateAttendanceMutation] = useUpdateAttendanceMutation();

  const createAttendance = React.useCallback(
    (input: CreateAttendanceInput) => createAttendanceMutation(input).unwrap(),
    [createAttendanceMutation]
  );

  const updateAttendance = React.useCallback(
    (input: UpdateAttendanceInput) => updateAttendanceMutation(input).unwrap(),
    [updateAttendanceMutation]
  );

  const mode = searchParams.get("mode");
  const qrMode = mode === "clock_in" || mode === "clock_out" ? mode : null;
  const timestamp = searchParams.get("timestamp");
  const token = searchParams.get("token");

  const today = React.useMemo(
    () => dayjs().format(AttendanceDate.DataFormat),
    []
  );

  React.useEffect(() => {
    setIsOfficeModeEnabled(getOfficeMode());
  }, [getOfficeMode]);

  React.useEffect(() => {
    let isMounted = true;

    const validate = async () => {
      const isValid = await validateOfficeQrToken(timestamp, token);
      if (isMounted) {
        setIsValidToken(isValid);
      }
    };

    void validate();

    return () => {
      isMounted = false;
    };
  }, [timestamp, token]);

  React.useEffect(() => {
    if (!isOfficeModeEnabled || !cognitoUser?.id) {
      setAttendance(null);
      return;
    }

    let isMounted = true;

    triggerGetAttendance({ staffId: cognitoUser.id, workDate: today })
      .unwrap()
      .then((data) => {
        if (isMounted) {
          setAttendance(data ?? null);
        }
      })
      .catch((error) => {
        logger.debug("Failed to fetch attendance for office QR", error);
      });

    return () => {
      isMounted = false;
    };
  }, [
    cognitoUser?.id,
    isOfficeModeEnabled,
    today,
    triggerGetAttendance,
    logger,
  ]);

  const handleClockIn = React.useCallback(async () => {
    if (!cognitoUser) {
      return;
    }

    const now = dayjs().second(0).millisecond(0).toISOString();

    try {
      const result = await clockInAction({
        attendance,
        staffId: cognitoUser.id,
        workDate: today,
        startTime: now,
        createAttendance,
        updateAttendance,
      });

      setAttendance(result);

      try {
        const pressedAt = getNowISOStringWithZeroSeconds();
        const input = {
          staffId: cognitoUser.id,
          action: "clock_in",
          resource: "attendance",
          resourceId: result?.id ?? undefined,
          timestamp: pressedAt,
          details: JSON.stringify({
            workDate: today,
            attendanceTime: now,
          }),
          userAgent:
            typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        };

        await createOperationLogData(input);
      } catch (logErr) {
        logger.error(
          "Failed to create operation log for office QR clockIn",
          logErr
        );
      }

      dispatch(setSnackbarSuccess("出勤が記録されました。"));
    } catch (error) {
      logger.debug(error);
      dispatch(setSnackbarError("出勤処理に失敗しました。"));
    }
  }, [
    attendance,
    cognitoUser,
    createAttendance,
    dispatch,
    logger,
    today,
    updateAttendance,
  ]);

  const handleClockOut = React.useCallback(async () => {
    if (!cognitoUser) {
      return;
    }

    const now = dayjs().second(0).millisecond(0).toISOString();

    try {
      const result = await clockOutAction({
        attendance,
        staffId: cognitoUser.id,
        workDate: today,
        endTime: now,
        createAttendance,
        updateAttendance,
      });

      setAttendance(result);

      try {
        const pressedAt = getNowISOStringWithZeroSeconds();
        const input = {
          staffId: cognitoUser.id,
          action: "clock_out",
          resource: "attendance",
          resourceId: result?.id ?? undefined,
          timestamp: pressedAt,
          details: JSON.stringify({
            workDate: today,
            attendanceTime: now,
          }),
          userAgent:
            typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        };

        await createOperationLogData(input);
      } catch (logErr) {
        logger.error(
          "Failed to create operation log for office QR clockOut",
          logErr
        );
      }

      dispatch(setSnackbarSuccess("退勤が記録されました。"));
    } catch (error) {
      logger.debug(error);
      dispatch(setSnackbarError("退勤処理に失敗しました。"));
    }
  }, [
    attendance,
    cognitoUser,
    createAttendance,
    dispatch,
    logger,
    today,
    updateAttendance,
  ]);

  const getErrorMessage = () => {
    if (!isValidToken) {
      return "無効なトークンです。トークンの有効期限が切れている可能性があります。";
    }
    if (!qrMode) {
      return "無効なアクセスです。";
    }
    return null;
  };

  const errorMessage = getErrorMessage();

  return (
    <OfficeQrRegisterPanel
      isOfficeModeEnabled={isOfficeModeEnabled}
      errorMessage={errorMessage}
      mode={qrMode}
      onClockIn={handleClockIn}
      onClockOut={handleClockOut}
    />
  );
};

export default OfficeQRRegister;
