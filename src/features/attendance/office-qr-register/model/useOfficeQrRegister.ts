import {
  useCreateAttendanceMutation,
  useLazyGetAttendanceByStaffAndDateQuery,
  useUpdateAttendanceMutation,
} from "@entities/attendance/api/attendanceApi";
import createOperationLogData from "@entities/operation-log/model/createOperationLogData";
import type {
  Attendance,
  CreateAttendanceInput,
  UpdateAttendanceInput,
} from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AuthContext } from "@/context/AuthContext";
import {
  clockInAction,
  clockOutAction,
} from "@/entities/attendance/lib/attendance/attendanceActions";
import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";
import { getNowISOStringWithZeroSeconds } from "@/entities/attendance/lib/time";
import { Logger } from "@/shared/lib/logger";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

import { validateOfficeQrToken } from "../lib/validateToken";

type ClockMode = "clock_in" | "clock_out" | null;

export function useOfficeQrRegister() {
  const dispatch = useDispatch();
  const logger = useMemo(
    () =>
      new Logger("OfficeQrRegister", import.meta.env.DEV ? "DEBUG" : "ERROR"),
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

  const createAttendance = useCallback(
    (input: CreateAttendanceInput) => createAttendanceMutation(input).unwrap(),
    [createAttendanceMutation]
  );

  const updateAttendance = useCallback(
    (input: UpdateAttendanceInput) => updateAttendanceMutation(input).unwrap(),
    [updateAttendanceMutation]
  );

  const modeParam = searchParams.get("mode");
  const qrMode: ClockMode =
    modeParam === "clock_in" || modeParam === "clock_out" ? modeParam : null;
  const timestamp = searchParams.get("timestamp");
  const token = searchParams.get("token");

  const today = useMemo(() => dayjs().format(AttendanceDate.DataFormat), []);

  useEffect(() => {
    setIsOfficeModeEnabled(getOfficeMode());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
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

  useEffect(() => {
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

  const handleClockIn = useCallback(async () => {
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
          action: "clock_in" as const,
          resource: "attendance" as const,
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

  const handleClockOut = useCallback(async () => {
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
          action: "clock_out" as const,
          resource: "attendance" as const,
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

  const errorMessage = useMemo(() => {
    if (!isValidToken) {
      return "無効なトークンです。トークンの有効期限が切れている可能性があります。";
    }
    if (!qrMode) {
      return "無効なアクセスです。";
    }
    return null;
  }, [isValidToken, qrMode]);

  return {
    isOfficeModeEnabled,
    errorMessage,
    mode: qrMode,
    handleClockIn,
    handleClockOut,
  } as const;
}
