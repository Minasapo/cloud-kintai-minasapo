import "./styles.scss";

import {
  Alert,
  AlertTitle,
  Box,
  Chip,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { Attendance } from "@/API";
import { useAppDispatchV2 } from "@/app/hooks";
import MoveDateItem from "@/components/AttendanceDailyList/MoveDateItem";
import { AppConfigContext } from "@/context/AppConfigContext";
import { useLazyListRecentAttendancesQuery } from "@/entities/attendance/api/attendanceApi";
import {
  useGetCompanyHolidayCalendarsQuery,
  useGetHolidayCalendarsQuery,
} from "@/entities/calendar/api/calendarApi";
import * as MESSAGE_CODE from "@/errors";
import { AttendanceDate } from "@/lib/AttendanceDate";
import { setSnackbarError } from "@/lib/reducers/snackbarReducer";

import useAttendanceDaily, {
  AttendanceDaily,
} from "../../hooks/useAttendanceDaily/useAttendanceDaily";
import { ActionsTableCell } from "./ActionsTableCell";
import { EndTimeTableCell } from "./EndTimeTableCell";
import {
  calculateTotalOvertimeMinutes,
  formatMinutesToHHmm,
} from "./overtimeUtils";
import { StartTimeTableCell } from "./StartTimeTableCell";

export default function AttendanceDailyList() {
  const { targetWorkDate } = useParams();
  const { attendanceDailyList, error, loading } = useAttendanceDaily();
  const { getEndTime } = useContext(AppConfigContext);
  const today = dayjs().format(AttendanceDate.QueryParamFormat);
  const dispatch = useAppDispatchV2();
  const [searchName, setSearchName] = useState("");
  const [triggerListAttendances] = useLazyListRecentAttendancesQuery();
  const {
    data: holidayCalendars = [],
    isLoading: isHolidayCalendarsLoading,
    isFetching: isHolidayCalendarsFetching,
    error: holidayCalendarsError,
  } = useGetHolidayCalendarsQuery();
  const {
    data: companyHolidayCalendars = [],
    isLoading: isCompanyHolidayCalendarsLoading,
    isFetching: isCompanyHolidayCalendarsFetching,
    error: companyHolidayCalendarsError,
  } = useGetCompanyHolidayCalendarsQuery();
  const calendarsLoading =
    isHolidayCalendarsLoading ||
    isHolidayCalendarsFetching ||
    isCompanyHolidayCalendarsLoading ||
    isCompanyHolidayCalendarsFetching;

  const scheduledEnd = useMemo(() => {
    const parsed = getEndTime();
    return { hour: parsed.hour(), minute: parsed.minute() };
  }, [getEndTime]);
  const scheduledHour = scheduledEnd.hour;
  const scheduledMinute = scheduledEnd.minute;

  useEffect(() => {
    if (error) {
      dispatch(setSnackbarError(MESSAGE_CODE.E00001));
      console.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (holidayCalendarsError || companyHolidayCalendarsError) {
      dispatch(setSnackbarError(MESSAGE_CODE.E00001));
      console.error(holidayCalendarsError ?? companyHolidayCalendarsError);
    }
  }, [holidayCalendarsError, companyHolidayCalendarsError, dispatch]);

  const sortedAttendanceList = useMemo(() => {
    // create a copy before sort to avoid mutating the original attendanceDailyList
    return [...(attendanceDailyList || [])].sort((a, b) => {
      const aSortKey = a.sortKey || "";
      const bSortKey = b.sortKey || "";
      return aSortKey.localeCompare(bSortKey);
    });
  }, [attendanceDailyList]);

  const renderSummaryMessage = useCallback((row: AttendanceDaily) => {
    if (!row.attendance) return "";
    const {
      substituteHolidayDate,
      remarks,
      specialHolidayFlag,
      paidHolidayFlag,
      absentFlag,
    } = row.attendance;

    const isSubstituteHoliday = substituteHolidayDate
      ? dayjs(substituteHolidayDate).isValid()
      : false;

    const full = (() => {
      const parts: string[] = [];
      if (isSubstituteHoliday) parts.push("振替休日");
      if (remarks) parts.push(remarks);
      return parts.join(" ");
    })();

    const MAX = 32;
    const needTruncate = full && full.length > MAX;
    const visible = needTruncate ? `${full.slice(0, MAX)}...` : full;

    return (
      <Box component="span">
        <Stack direction="row" spacing={0.5} alignItems="center">
          {specialHolidayFlag && (
            <Chip size="small" label="特別休暇" color="info" />
          )}
          {paidHolidayFlag && (
            <Chip size="small" label="有給休暇" color="success" />
          )}
          {absentFlag && <Chip size="small" label="欠勤" color="error" />}

          {needTruncate ? (
            <Tooltip title={full} arrow placement="top">
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  verticalAlign: "middle",
                  ml: 0.5,
                }}
              >
                {visible}
              </Box>
            </Tooltip>
          ) : (
            <Box component="span" sx={{ ml: 0.5 }}>
              {visible}
            </Box>
          )}
        </Stack>
      </Box>
    );
  }, []);

  const filteredAttendanceList = useMemo(() => {
    if (!searchName) return sortedAttendanceList;
    return sortedAttendanceList.filter((row) => {
      const fullName = `${row.familyName || ""}${row.givenName || ""}`;
      return fullName.includes(searchName);
    });
  }, [searchName, sortedAttendanceList]);

  // map of staffId -> attendances
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, Attendance[]>
  >({});
  const [attendanceLoadingMap, setAttendanceLoadingMap] = useState<
    Record<string, boolean>
  >({});
  const [attendanceErrorMap, setAttendanceErrorMap] = useState<
    Record<string, Error | null>
  >({});

  const overtimeMinutesMap = useMemo(() => {
    return Object.entries(attendanceMap).reduce(
      (acc, [staffId, attendances]) => {
        acc[staffId] = calculateTotalOvertimeMinutes(
          attendances,
          scheduledHour,
          scheduledMinute
        );
        return acc;
      },
      {} as Record<string, number>
    );
  }, [attendanceMap, scheduledHour, scheduledMinute]);

  const getOvertimeMinutes = useCallback(
    (row: AttendanceDaily) => {
      const mapped = overtimeMinutesMap[row.sub];
      if (typeof mapped === "number") {
        return mapped;
      }
      if (!row.attendance) return 0;
      return calculateTotalOvertimeMinutes(
        [row.attendance],
        scheduledHour,
        scheduledMinute
      );
    },
    [overtimeMinutesMap, scheduledHour, scheduledMinute]
  );

  const renderOvertimeValue = useCallback(
    (row: AttendanceDaily) => formatMinutesToHHmm(getOvertimeMinutes(row)),
    [getOvertimeMinutes]
  );

  useEffect(() => {
    const staffIds = Array.from(
      new Set((attendanceDailyList || []).map((r) => r.sub))
    );

    if (staffIds.length === 0) {
      return;
    }

    let isMounted = true;

    staffIds.forEach((staffId) => {
      setAttendanceLoadingMap((state) => ({ ...state, [staffId]: true }));
      setAttendanceErrorMap((state) => ({ ...state, [staffId]: null }));

      triggerListAttendances({ staffId })
        .unwrap()
        .then((res) => {
          if (!isMounted) return;
          setAttendanceMap((map) => ({ ...map, [staffId]: res }));
        })
        .catch((err) => {
          if (!isMounted) return;
          const errorInstance =
            err instanceof Error
              ? err
              : new Error("Failed to fetch attendances");
          setAttendanceErrorMap((state) => ({
            ...state,
            [staffId]: errorInstance,
          }));
        })
        .finally(() => {
          if (!isMounted) return;
          setAttendanceLoadingMap((state) => ({
            ...state,
            [staffId]: false,
          }));
        });
    });

    return () => {
      isMounted = false;
    };
  }, [attendanceDailyList, triggerListAttendances]);

  const isRequesting = useCallback((row: AttendanceDaily) => {
    if (!row.attendance?.changeRequests) return false;
    const changeRequests = row.attendance.changeRequests || [];
    return changeRequests.filter((item) => item && !item.completed).length > 0;
  }, []);

  const pendingList = useMemo(() => {
    if (loading) return [];
    return attendanceDailyList.filter((row) => {
      // prefer loaded attendance records from attendanceMap
      const attendances = attendanceMap[row.sub] ?? [];
      const hasPendingInAttendances = attendances.some((att) => {
        if (!att) return false;
        const changeRequests = (att as Attendance).changeRequests || [];
        return (
          changeRequests.filter((item) => item && !item.completed).length > 0
        );
      });
      if (hasPendingInAttendances) return true;
      // fallback to the row.attendance (existing behavior) when attendanceMap has no data
      return isRequesting(row);
    });
  }, [loading, attendanceDailyList, attendanceMap, isRequesting]);

  if (loading || calendarsLoading) {
    return <LinearProgress sx={{ width: "100%" }} />;
  }

  return (
    <Stack direction="column" spacing={1}>
      <MoveDateItem workDate={dayjs(targetWorkDate || today)} />
      <TextField
        label="スタッフ名で検索"
        variant="outlined"
        size="small"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
        sx={{ mb: 1 }}
      />
      {pendingList.length > 0 && (
        <Box sx={{ pb: 2, pt: 2 }}>
          <Box
            sx={{
              border: "1px solid",
              borderColor: "warning.main",
              borderRadius: 2,
              p: 2,
              backgroundColor: "rgba(255,243,205,0.12)",
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              申請中のスタッフ ({pendingList.length})
            </Typography>
            <Alert severity="warning">
              <AlertTitle sx={{ fontWeight: "bold" }}>
                確認してください
              </AlertTitle>
              申請中のスタッフがあります。承認されるまで反映されません
            </Alert>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell className="table-cell-header--staff-name">
                      氏名
                    </TableCell>
                    <TableCell className="table-cell-header--start-time">
                      出勤時刻
                    </TableCell>
                    <TableCell className="table-cell-header--end-time">
                      退勤時刻
                    </TableCell>
                    <TableCell className="table-cell-header--overtime">
                      残業時間
                    </TableCell>
                    <TableCell>摘要</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingList.map((row, index) => (
                    <TableRow
                      key={`pending-${index}`}
                      className="attendance-row"
                    >
                      <ActionsTableCell
                        row={row}
                        attendances={attendanceMap[row.sub] ?? []}
                        attendanceLoading={!!attendanceLoadingMap[row.sub]}
                        attendanceError={attendanceErrorMap[row.sub] ?? null}
                        holidayCalendars={holidayCalendars}
                        companyHolidayCalendars={companyHolidayCalendars}
                        calendarLoading={calendarsLoading}
                      />
                      <TableCell>{`${row.familyName} ${row.givenName}`}</TableCell>
                      <StartTimeTableCell row={row} />
                      <EndTimeTableCell row={row} />
                      <TableCell sx={{ textAlign: "right" }}>
                        {renderOvertimeValue(row)}
                      </TableCell>
                      <TableCell>{renderSummaryMessage(row)}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }} />
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      )}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell className="table-cell-header--staff-name">
                氏名
              </TableCell>
              <TableCell className="table-cell-header--start-time">
                出勤時刻
              </TableCell>
              <TableCell className="table-cell-header--end-time">
                退勤時刻
              </TableCell>
              <TableCell className="table-cell-header--overtime">
                残業時間
              </TableCell>
              <TableCell>摘要</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAttendanceList.map((row, index) => (
              <TableRow key={index} className="attendance-row">
                <ActionsTableCell
                  row={row}
                  attendances={attendanceMap[row.sub] ?? []}
                  attendanceLoading={!!attendanceLoadingMap[row.sub]}
                  attendanceError={attendanceErrorMap[row.sub] ?? null}
                  holidayCalendars={holidayCalendars}
                  companyHolidayCalendars={companyHolidayCalendars}
                  calendarLoading={calendarsLoading}
                />
                <TableCell>{`${row.familyName} ${row.givenName}`}</TableCell>
                <StartTimeTableCell row={row} />
                <EndTimeTableCell row={row} />
                <TableCell sx={{ textAlign: "right" }}>
                  {renderOvertimeValue(row)}
                </TableCell>
                <TableCell>{renderSummaryMessage(row)}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
