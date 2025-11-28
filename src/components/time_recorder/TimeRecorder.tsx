import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Grid,
  LinearProgress,
  SxProps,
  Typography,
} from "@mui/material";
import { Theme } from "@mui/material/styles";
import { Logger } from "aws-amplify";
import dayjs from "dayjs";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { Staff } from "@/API";
import { AppConfigContext } from "@/context/AppConfigContext";
import { AppContext } from "@/context/AppContext";
import { AuthContext } from "@/context/AuthContext";
import { AttendanceDate } from "@/lib/AttendanceDate";
import { AttendanceState, AttendanceStatus } from "@/lib/AttendanceState";

import { useAppDispatchV2 } from "../../app/hooks";
import * as MESSAGE_CODE from "../../errors";
import useAttendance from "../../hooks/useAttendance/useAttendance";
import { getWorkStatus } from "../../hooks/useAttendance/WorkStatus";
import useAttendances from "../../hooks/useAttendances/useAttendances";
import fetchStaff from "../../hooks/useStaff/fetchStaff";
import { setSnackbarError } from "../../lib/reducers/snackbarReducer";
import Clock from "../clock/Clock";
import { AttendanceErrorAlert } from "./AttendanceErrorAlert";
import { clockInCallback } from "./clockInCallback";
import { clockOutCallback } from "./clockOutCallback";
import { WorkStatus } from "./common";
import { DirectSwitch } from "./DirectSwitch";
import { goDirectlyCallback } from "./goDirectlyCallback";
import ClockInItem from "./items/ClockInItem";
import ClockOutItem from "./items/ClockOutItem";
import GoDirectlyItem from "./items/GoDirectlyItem";
import RestEndItem from "./items/RestEndItem";
import RestStartItem from "./items/RestStartItem";
import ReturnDirectly from "./items/ReturnDirectlyItem";
import { restEndCallback } from "./restEndCallback";
import { restStartCallback } from "./restStartCallback";
import { RestTimeMessage } from "./RestTimeMessage";
import { returnDirectlyCallback } from "./returnDirectlyCallback";

/**
 * 勤怠打刻用のメインコンポーネント。
 * ユーザーの勤怠状態に応じて打刻・休憩・直行直帰などの操作UIを表示する。
 * @returns {JSX.Element} 勤怠打刻UI
 */
export default function TimeRecorder(): JSX.Element {
  const { cognitoUser } = useContext(AuthContext);

  const dispatch = useAppDispatchV2();

  const {
    attendance,
    loading: attendanceLoading,
    getAttendance,
    clockIn,
    clockOut,
    restStart,
    restEnd,
    updateRemarks,
  } = useAttendance();

  const {
    attendances,
    getAttendances,
    loading: attendancesLoading,
  } = useAttendances();

  const { holidayCalendars, companyHolidayCalendars } = useContext(AppContext);
  const { getStartTime, getEndTime } = useContext(AppConfigContext);

  const [workStatus, setWorkStatus] = useState<WorkStatus | null | undefined>(
    undefined
  );
  const [staff, setStaff] = useState<Staff | null | undefined>(undefined);
  const [isAttendanceError, setIsAttendanceError] = useState(false);
  const [isTimeElapsedError, setIsTimeElapsedError] = useState(false);
  const [directMode, setDirectMode] = useState(false);
  const [lastActiveTime, setLastActiveTime] = useState(dayjs());

  const today = useMemo(() => dayjs().format(AttendanceDate.DataFormat), []);

  const logger = useMemo(() => new Logger("TimeRecorder", "DEBUG"), []);

  const clockInDisplayText = useMemo(() => {
    if (!attendance?.startTime) {
      return null;
    }
    return `${dayjs(attendance.startTime).format("HH:mm")} 出勤`;
  }, [attendance?.startTime]);

  const clockOutDisplayText = useMemo(() => {
    if (!attendance?.endTime) {
      return null;
    }
    return `${dayjs(attendance.endTime).format("HH:mm")} 退勤`;
  }, [attendance?.endTime]);

  const clockInBadgeStyles: SxProps<Theme> = {
    display: "inline-block",
    px: 1.5,
    py: 0.25,
    borderRadius: 1,
    bgcolor: "#E4F8C9",
    color: (theme) => theme.palette.success.dark,
    fontWeight: 700,
  };

  const clockOutBadgeStyles: SxProps<Theme> = {
    display: "inline-block",
    px: 1.5,
    py: 0.25,
    borderRadius: 1,
    bgcolor: "#FDE0E0",
    color: (theme) => theme.palette.error.dark,
    fontWeight: 700,
  };

  const handleClockIn = useCallback(
    () => clockInCallback(cognitoUser, today, clockIn, dispatch, staff, logger),
    [cognitoUser, clockIn, dispatch, staff]
  );

  const handleClockOut = useCallback(
    () =>
      clockOutCallback(cognitoUser, today, clockOut, dispatch, staff, logger),
    [cognitoUser, clockOut, dispatch, staff]
  );

  const handleGoDirectly = useCallback(() => {
    const configured = getStartTime();
    const startIso = dayjs()
      .hour(configured.hour())
      .minute(configured.minute())
      .second(0)
      .millisecond(0)
      .toISOString();

    goDirectlyCallback(
      cognitoUser,
      today,
      staff,
      dispatch,
      clockIn,
      logger,
      startIso
    );
  }, [cognitoUser, clockIn, dispatch, staff, getStartTime, today, logger]);

  const handleReturnDirectly = useCallback(() => {
    const configured = getEndTime();
    const endIso = dayjs()
      .hour(configured.hour())
      .minute(configured.minute())
      .second(0)
      .millisecond(0)
      .toISOString();

    returnDirectlyCallback(
      cognitoUser,
      today,
      staff,
      dispatch,
      clockOut,
      logger,
      endIso
    );
  }, [cognitoUser, staff, dispatch, clockOut, getEndTime, today, logger]);

  const handleRestStart = useCallback(
    () => restStartCallback(cognitoUser, today, dispatch, restStart, logger),
    [cognitoUser, restStart, dispatch]
  );

  const handleRestEnd = useCallback(
    () => restEndCallback(cognitoUser, today, restEnd, dispatch, logger),
    [cognitoUser, restEnd, dispatch]
  );

  const handleVisibilityChange = useMemo(() => {
    return () => {
      const now = dayjs();
      if (document.visibilityState === "visible") {
        if (now.diff(lastActiveTime, "minute") > 5) {
          window.location.reload();
        }
        setLastActiveTime(now);
      }
    };
  }, [lastActiveTime]);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  useEffect(() => {
    if (!cognitoUser) return;

    getAttendance(cognitoUser.id, today).catch(() => {
      dispatch(setSnackbarError(MESSAGE_CODE.E01001));
    });

    getAttendances(cognitoUser.id).catch(() =>
      dispatch(setSnackbarError(MESSAGE_CODE.E02001))
    );

    fetchStaff(cognitoUser.id)
      .then(setStaff)
      .catch(() => dispatch(setSnackbarError(MESSAGE_CODE.E00001)));
  }, [cognitoUser]);

  useEffect(() => {
    if (!staff || attendanceLoading) {
      return;
    }

    const errorCount = attendances
      .map((attendance) => {
        const status = new AttendanceState(
          staff,
          attendance,
          holidayCalendars,
          companyHolidayCalendars
        ).get();
        return status;
      })
      .filter((status) => status === AttendanceStatus.Error).length;

    setIsAttendanceError(errorCount > 0);

    // 1週間以上前にエラーがあるかチェック
    const timeElapsedErrorCount = attendances.filter((attendance) => {
      const { workDate } = attendance;
      const isAfterOneWeek = dayjs().isAfter(dayjs(workDate).add(1, "week"));
      if (!isAfterOneWeek) return false;
      const status = new AttendanceState(
        staff,
        attendance,
        holidayCalendars,
        companyHolidayCalendars
      ).get();
      return status === AttendanceStatus.Error;
    }).length;

    setIsTimeElapsedError(timeElapsedErrorCount > 0);
  }, [
    attendanceLoading,
    attendancesLoading,
    staff,
    holidayCalendars,
    companyHolidayCalendars,
  ]);

  useEffect(() => {
    setWorkStatus(getWorkStatus(attendance));
  }, [attendance]);

  if (attendanceLoading || workStatus === undefined) {
    return (
      <Box
        sx={{
          width: { xs: "100%", md: "400px" },
        }}
      >
        <LinearProgress />
      </Box>
    );
  }

  if (workStatus === null) {
    dispatch(setSnackbarError(MESSAGE_CODE.E00001));
    return <></>;
  }

  return (
    <Box
      sx={{
        width: { xs: "100%", md: "400px" },
        mx: { xs: 3, md: 0 },
      }}
    >
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography
            variant="h6"
            textAlign="center"
            data-testid="work-status-text"
          >
            {workStatus.text || "読み込み中..."}
          </Typography>
          {(clockInDisplayText || clockOutDisplayText) && (
            <Box display="flex" justifyContent="center" gap={1} mt={0.5}>
              {clockInDisplayText && (
                <Typography
                  variant="body2"
                  textAlign="center"
                  data-testid="clock-in-time-text"
                  sx={clockInBadgeStyles}
                >
                  {clockInDisplayText}
                </Typography>
              )}
              {clockOutDisplayText && (
                <Typography
                  variant="body2"
                  textAlign="center"
                  data-testid="clock-out-time-text"
                  sx={clockOutBadgeStyles}
                >
                  {clockOutDisplayText}
                </Typography>
              )}
            </Box>
          )}
        </Grid>
        <Grid item xs={12}>
          <Clock />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <DirectSwitch
                onChange={() => setDirectMode(!directMode)}
                inputProps={
                  {
                    "data-testid": "direct-mode-switch",
                  } as React.InputHTMLAttributes<HTMLInputElement>
                }
              />
            }
            label="直行/直帰モード"
          />
        </Grid>
        <Grid item xs={6} sx={{ display: "flex", justifyContent: "center" }}>
          {directMode ? (
            <GoDirectlyItem
              workStatus={workStatus}
              onClick={handleGoDirectly}
            />
          ) : (
            <ClockInItem workStatus={workStatus} onClick={handleClockIn} />
          )}
        </Grid>
        <Grid item xs={6} sx={{ display: "flex", justifyContent: "center" }}>
          {directMode ? (
            <ReturnDirectly
              workStatus={workStatus}
              onClick={handleReturnDirectly}
            />
          ) : (
            <ClockOutItem workStatus={workStatus} onClick={handleClockOut} />
          )}
        </Grid>

        {/* 休憩 */}
        <Grid item xs={6}>
          <RestStartItem workStatus={workStatus} onClick={handleRestStart} />
        </Grid>
        <Grid item xs={6}>
          <RestEndItem workStatus={workStatus} onClick={handleRestEnd} />
        </Grid>

        {/* <Grid item xs={12}>
          <TimeRecorderRemarks
            attendance={attendance}
            onSave={(remarks) => {
              if (!cognitoUser) return;

              updateRemarks(cognitoUser.id, today, remarks || "")
                .then(() => {
                  dispatch(setSnackbarSuccess(MESSAGE_CODE.S02003));
                })
                .catch((e) => {
                  logger.debug(e);
                  dispatch(setSnackbarError(MESSAGE_CODE.E02003));
                });
            }}
          />
        </Grid> */}
        {isAttendanceError && (
          <Grid item xs={12}>
            <AttendanceErrorAlert />
          </Grid>
        )}

        <TimeElapsedErrorDialog isTimeElapsedError={isTimeElapsedError} />

        <Grid item xs={12}>
          <RestTimeMessage />
        </Grid>
      </Grid>
    </Box>
  );
}

/**
 * 1週間以上経過した打刻エラーがある場合に表示するダイアログコンポーネント。
 * @param isTimeElapsedError - エラーが存在するかどうかのフラグ
 * @returns {JSX.Element} ダイアログUI
 */
function TimeElapsedErrorDialog({
  isTimeElapsedError,
}: {
  isTimeElapsedError: boolean;
}): JSX.Element {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(isTimeElapsedError);
  }, [isTimeElapsedError]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      data-testid="time-elapsed-error-dialog"
    >
      <DialogTitle id="alert-dialog-title">
        <span data-testid="time-elapsed-error-dialog-title-text">
          1週間以上経過した打刻エラーがあります
        </span>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          <span data-testid="time-elapsed-error-dialog-description-text">
            1週間以上経過した打刻エラーがあります。
          </span>
          <br />
          勤怠一覧を確認して打刻修正を申請してください。
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          data-testid="time-elapsed-error-dialog-later-btn"
        >
          あとで
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            handleClose();
            window.open("/attendance/list", "_blank");
          }}
          data-testid="time-elapsed-error-dialog-confirm-btn"
        >
          確認する
        </Button>
      </DialogActions>
    </Dialog>
  );
}
