import "./styles.scss";

import {
  Alert,
  AlertTitle,
  Box,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { Attendance } from "@/API";
import { useAppDispatchV2 } from "@/app/hooks";
import MoveDateItem from "@/components/AttendanceDailyList/MoveDateItem";
import * as MESSAGE_CODE from "@/errors";
import fetchAttendances from "@/hooks/useAttendances/fetchAttendances";
import { AttendanceDate } from "@/lib/AttendanceDate";
import { setSnackbarError } from "@/lib/reducers/snackbarReducer";

import useAttendanceDaily, {
  AttendanceDaily,
} from "../../hooks/useAttendanceDaily/useAttendanceDaily";
import { ActionsTableCell } from "./ActionsTableCell";
import { EndTimeTableCell } from "./EndTimeTableCell";
import { StartTimeTableCell } from "./StartTimeTableCell";

export default function AttendanceDailyList() {
  const { targetWorkDate } = useParams();
  const { attendanceDailyList, error, loading } = useAttendanceDaily();
  const today = dayjs().format(AttendanceDate.QueryParamFormat);
  const dispatch = useAppDispatchV2();
  const [searchName, setSearchName] = useState("");

  useEffect(() => {
    if (error) {
      dispatch(setSnackbarError(MESSAGE_CODE.E00001));
      console.error(error);
    }
  }, [error]);

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
    const { paidHolidayFlag, substituteHolidayDate, remarks } = row.attendance;
    const isSubstituteHoliday = substituteHolidayDate
      ? dayjs(substituteHolidayDate).isValid()
      : false;

    const summaryMessage = [];
    if (paidHolidayFlag) summaryMessage.push("有給休暇");
    if (isSubstituteHoliday) summaryMessage.push("振替休日");
    if (remarks) summaryMessage.push(remarks);

    return summaryMessage.join(" ");
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

  // 並列リクエスト数を制限するバッチ処理関数
  async function processInBatches<T>(
    items: T[],
    batchSize: number,
    fn: (item: T) => Promise<void>
  ) {
    let idx = 0;
    while (idx < items.length) {
      const batch = items.slice(idx, idx + batchSize);
      await Promise.all(batch.map(fn));
      idx += batchSize;
    }
  }

  useEffect(() => {
    // load attendances for visible staff rows
    const staffIds = Array.from(
      new Set((attendanceDailyList || []).map((r) => r.sub))
    );

    // 並列リクエスト数を5件に制限
    processInBatches(staffIds, 5, async (staffId) => {
      setAttendanceLoadingMap((s) => ({ ...s, [staffId]: true }));
      setAttendanceErrorMap((s) => ({ ...s, [staffId]: null }));
      try {
        const res = await fetchAttendances(staffId);
        setAttendanceMap((m) => ({ ...m, [staffId]: res }));
      } catch (e) {
        setAttendanceErrorMap((s) => ({ ...s, [staffId]: e as Error }));
      } finally {
        setAttendanceLoadingMap((s) => ({ ...s, [staffId]: false }));
      }
    });
  }, [attendanceDailyList]);

  const isRequesting = useCallback((row: AttendanceDaily) => {
    if (!row.attendance?.changeRequests) return false;
    const changeRequests = row.attendance.changeRequests || [];
    return changeRequests.filter((item) => item && !item.completed).length > 0;
  }, []);

  // stable empty array to avoid creating a new [] on every render when attendanceMap has no data
  const emptyAttendances = useMemo(() => [] as Attendance[], []);

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

  if (loading) {
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
                        attendances={attendanceMap[row.sub] ?? emptyAttendances}
                        attendanceLoading={!!attendanceLoadingMap[row.sub]}
                        attendanceError={attendanceErrorMap[row.sub] ?? null}
                      />
                      <TableCell>{`${row.familyName} ${row.givenName}`}</TableCell>
                      <StartTimeTableCell row={row} />
                      <EndTimeTableCell row={row} />
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
              <TableCell>摘要</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAttendanceList.map((row, index) => (
              <TableRow key={index} className="attendance-row">
                <ActionsTableCell
                  row={row}
                  attendances={attendanceMap[row.sub] ?? emptyAttendances}
                  attendanceLoading={!!attendanceLoadingMap[row.sub]}
                  attendanceError={attendanceErrorMap[row.sub] ?? null}
                />
                <TableCell>{`${row.familyName} ${row.givenName}`}</TableCell>
                <StartTimeTableCell row={row} />
                <EndTimeTableCell row={row} />
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
