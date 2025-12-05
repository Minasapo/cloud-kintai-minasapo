/**
 * スタッフ向けの勤怠一覧ページのコンポーネント。
 * ユーザーの勤怠情報を取得し、デスクトップ・モバイル両方のリストで表示する。
 * MaterialUIを使用し、日付選択や合計勤務時間の表示も行う。
 */
import {
  Box,
  Breadcrumbs,
  LinearProgress,
  Stack,
  styled,
  Typography,
} from "@mui/material";
/**
 * MaterialUIのDatePickerコンポーネント。
 */
import { DatePicker } from "@mui/x-date-pickers";
/**
 * AmplifyのLogger。デバッグ・エラー出力に使用。
 */
import { Logger } from "aws-amplify";
/**
 * 日付操作ライブラリ。日付のフォーマットや計算に使用。
 */
import dayjs from "dayjs";
/**
 * ReactのContext, Hooks。
 */
import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AppContext } from "@/context/AppContext";
import { AuthContext } from "@/context/AuthContext";
import { useListRecentAttendancesQuery } from "@/lib/api/attendanceApi";
import { AttendanceDate } from "@/lib/AttendanceDate";
import { calcTotalRestTime } from "@/pages/AttendanceEdit/DesktopEditor/RestTimeItem/RestTimeInput/RestTimeInput";
import { calcTotalWorkTime } from "@/pages/AttendanceEdit/DesktopEditor/WorkTimeInput/WorkTimeInput";

import { Staff } from "../../API";
import { useAppDispatchV2 } from "../../app/hooks";
import * as MESSAGE_CODE from "../../errors";
import fetchStaff from "../../hooks/useStaff/fetchStaff";
import { setSnackbarError } from "../../lib/reducers/snackbarReducer";
import Title from "../Title/Title";
// import DesktopCalendarView from "./DesktopCalendarView";
import DesktopList from "./DesktopList";
import MobileList from "./MobileList/MobileList";

/**
 * 勤怠一覧ページの説明文用Typographyコンポーネント。
 */
const DescriptionTypography = styled(Typography)(({ theme }) => ({
  padding: "0px 40px",
  [theme.breakpoints.down("md")]: {
    padding: "0px 10px",
  },
}));

/**
 * 勤怠一覧テーブルのメインコンポーネント。
 * ユーザーの勤怠データ取得、合計勤務時間計算、リスト表示を行う。
 * @returns JSX.Element
 */
export default function AttendanceTable() {
  /**
   * 認証済みユーザー情報。
   */
  const { cognitoUser } = useContext(AuthContext);
  /**
   * 祝日カレンダー情報。
   */
  const { holidayCalendars, companyHolidayCalendars } = useContext(AppContext);
  /**
   * Reduxのdispatch関数。
   */
  const dispatch = useAppDispatchV2();
  /**
   * ページ遷移用navigate関数。
   */
  const navigate = useNavigate();
  /**
   * 勤怠情報取得用カスタムフック。
   */
  const shouldFetchAttendances = Boolean(cognitoUser?.id);
  const {
    data: attendancesData,
    isLoading: isAttendancesInitialLoading,
    isFetching: isAttendancesFetching,
    isUninitialized: isAttendancesUninitialized,
    error: attendancesError,
  } = useListRecentAttendancesQuery(
    { staffId: cognitoUser?.id ?? "" },
    { skip: !shouldFetchAttendances }
  );

  const attendances = attendancesData ?? [];
  const attendanceLoading =
    !shouldFetchAttendances ||
    isAttendancesInitialLoading ||
    isAttendancesFetching ||
    isAttendancesUninitialized;

  /**
   * スタッフ情報の状態。
   */
  const [staff, setStaff] = useState<Staff | null | undefined>(undefined);

  /**
   * ログ出力用Logger。
   */
  const logger = new Logger(
    "AttendanceList",
    import.meta.env.DEV ? "DEBUG" : "ERROR"
  );

  /**
   * ユーザー情報取得・勤怠情報取得の副作用。
   */
  useEffect(() => {
    if (!cognitoUser) return;
    fetchStaff(cognitoUser.id)
      .then((res) => {
        setStaff(res);
      })
      .catch((error) => {
        logger.debug(error);
        dispatch(setSnackbarError(MESSAGE_CODE.E00001));
      });
  }, [cognitoUser, dispatch, logger]);

  useEffect(() => {
    if (attendancesError) {
      logger.debug(attendancesError);
      dispatch(setSnackbarError(MESSAGE_CODE.E02001));
    }
  }, [attendancesError, dispatch, logger]);

  /**
   * 勤怠データから合計勤務時間（休憩時間を除く）を計算する。
   */
  const totalTime = useMemo(() => {
    const totalWorkTime = attendances.reduce((acc, attendance) => {
      if (!attendance.startTime || !attendance.endTime) return acc;
      const workTime = calcTotalWorkTime(
        attendance.startTime,
        attendance.endTime
      );
      return acc + workTime;
    }, 0);

    const totalRestTime = attendances.reduce((acc, attendance) => {
      if (!attendance.rests) return acc;
      const restTime = attendance.rests
        .filter((item): item is NonNullable<typeof item> => !!item)
        .reduce((acc, rest) => {
          if (!rest.startTime || !rest.endTime) return acc;
          return acc + calcTotalRestTime(rest.startTime, rest.endTime);
        }, 0);
      return acc + restTime;
    }, 0);
    return totalWorkTime - totalRestTime;
  }, [attendances]);

  if (attendanceLoading) {
    return <LinearProgress />;
  }

  return (
    <Stack spacing={2}>
      <Box>
        <Breadcrumbs>
          <Link to="/" color="inherit">
            TOP
          </Link>
          <Typography color="text.primary">勤怠一覧</Typography>
        </Breadcrumbs>
      </Box>
      <Box>
        <Title>{`勤怠一覧(${totalTime.toFixed(1)}h)`}</Title>
      </Box>
      <DescriptionTypography variant="body1">
        今日から30日前までの勤怠情報を表示しています
      </DescriptionTypography>
      <Box
        sx={{
          pl: {
            md: 5,
          },
        }}
      >
        <DatePicker
          value={dayjs()}
          format={AttendanceDate.DisplayFormat}
          label="日付を指定して移動"
          slotProps={{
            textField: { size: "small" },
          }}
          onChange={(date) => {
            if (date) {
              navigate(
                `/attendance/${date.format(
                  AttendanceDate.QueryParamFormat
                )}/edit`
              );
            }
          }}
        />
      </Box>
      {/* <DesktopCalendarView
        attendances={attendances}
        holidayCalendars={holidayCalendars}
        companyHolidayCalendars={companyHolidayCalendars}
        navigate={navigate}
        staff={staff}
      /> */}
      <DesktopList
        attendances={attendances}
        holidayCalendars={holidayCalendars}
        companyHolidayCalendars={companyHolidayCalendars}
        navigate={navigate}
        staff={staff}
      />
      <MobileList
        attendances={attendances}
        holidayCalendars={holidayCalendars}
        companyHolidayCalendars={companyHolidayCalendars}
        staff={staff}
      />
    </Stack>
  );
}
