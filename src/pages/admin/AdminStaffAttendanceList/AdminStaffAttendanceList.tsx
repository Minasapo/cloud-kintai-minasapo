import "./styles.scss";

import { useAppDispatchV2 } from "@app/hooks";
import {
  useListRecentAttendancesQuery,
  useUpdateAttendanceMutation,
} from "@entities/attendance/api/attendanceApi";
import {
  useGetCompanyHolidayCalendarsQuery,
  useGetHolidayCalendarsQuery,
} from "@entities/calendar/api/calendarApi";
import handleApproveChangeRequest from "@features/attendance/edit/ChangeRequestDialog/handleApproveChangeRequest";
import { AttendanceStatusTooltip } from "@features/attendance/list/AttendanceStatusTooltip";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  Container,
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import {
  Attendance,
  AttendanceChangeRequest,
  CompanyHolidayCalendar,
  HolidayCalendar,
  Staff,
  UpdateAttendanceInput,
} from "@shared/api/graphql/types";
// Breadcrumbs removed per admin UI simplification
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import * as MESSAGE_CODE from "@/errors";
import createOperationLogData from "@/hooks/useOperationLog/createOperationLogData";
import fetchStaff from "@/hooks/useStaff/fetchStaff";
import { mappingStaffRole, StaffType } from "@/hooks/useStaffs/useStaffs";
import { AttendanceDate } from "@/lib/AttendanceDate";
import { ChangeRequest } from "@/lib/ChangeRequest";
import { CompanyHoliday } from "@/lib/CompanyHoliday";
import { DayOfWeek, DayOfWeekString } from "@/lib/DayOfWeek";
import { Holiday } from "@/lib/Holiday";
import { GenericMailSender } from "@/lib/mail/GenericMailSender";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";
import { AttendanceGraph } from "./AttendanceGraph";
import ChangeRequestQuickViewDialog from "./ChangeRequestQuickViewDialog";
import { CreatedAtTableCell } from "./CreatedAtTableCell";
import { RestTimeTableCell } from "./RestTimeTableCell";
import { SummaryTableCell } from "./SummaryTableCell";
import { UpdatedAtTableCell } from "./UpdatedAtTableCell";
import { WorkDateTableCell } from "./WorkDateTableCell";
import { WorkTimeTableCell } from "./WorkTimeTableCell";

export function getTableRowClassName(
  attendance: Attendance,
  holidayCalendars: HolidayCalendar[],
  companyHolidayCalendars: CompanyHolidayCalendar[]
) {
  const { workDate } = attendance;

  const today = dayjs().format(AttendanceDate.DataFormat);
  if (workDate === today) {
    return "table-row--today";
  }

  const isHoliday = new Holiday(holidayCalendars, workDate).isHoliday();
  const isCompanyHoliday = new CompanyHoliday(
    companyHolidayCalendars,
    workDate
  ).isHoliday();

  if (isHoliday || isCompanyHoliday) {
    return "table-row--sunday";
  }

  const dayOfWeek = new DayOfWeek(holidayCalendars).getLabel(workDate);
  switch (dayOfWeek) {
    case DayOfWeekString.Sat:
      return "table-row--saturday";
    case DayOfWeekString.Sun:
    case DayOfWeekString.Holiday:
      return "table-row--sunday";
    default:
      return "table-row--default";
  }
}

export default function AdminStaffAttendanceList() {
  const { staffId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatchV2();
  const [staff, setStaff] = useState<Staff | undefined | null>(undefined);

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
  const calendarLoading =
    isHolidayCalendarsLoading ||
    isHolidayCalendarsFetching ||
    isCompanyHolidayCalendarsLoading ||
    isCompanyHolidayCalendarsFetching;

  const shouldFetchAttendances = Boolean(staffId);
  const {
    data: attendancesData,
    isLoading: isAttendancesInitialLoading,
    isFetching: isAttendancesFetching,
    isUninitialized: isAttendancesUninitialized,
    error: attendancesError,
    refetch: refetchAttendances,
  } = useListRecentAttendancesQuery(
    { staffId: staffId ?? "" },
    { skip: !shouldFetchAttendances }
  );

  const attendances = attendancesData ?? [];
  const attendanceLoading =
    !shouldFetchAttendances ||
    isAttendancesInitialLoading ||
    isAttendancesFetching ||
    isAttendancesUninitialized;
  const [quickViewAttendance, setQuickViewAttendance] =
    useState<Attendance | null>(null);
  const [quickViewChangeRequest, setQuickViewChangeRequest] =
    useState<AttendanceChangeRequest | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [updateAttendanceMutation] = useUpdateAttendanceMutation();
  const staffForMail = useMemo<StaffType | null>(() => {
    if (!staff) return null;
    return {
      id: staff.id,
      cognitoUserId: staff.cognitoUserId,
      familyName: staff.familyName,
      givenName: staff.givenName,
      mailAddress: staff.mailAddress,
      owner: staff.owner ?? false,
      role: mappingStaffRole(staff.role),
      enabled: staff.enabled,
      status: staff.status,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
      usageStartDate: staff.usageStartDate,
      notifications: staff.notifications,
      workType: staff.workType,
      sortKey: staff.sortKey,
      developer: (staff as unknown as Record<string, unknown>).developer as
        | boolean
        | undefined,
      approverSetting: staff.approverSetting ?? null,
      approverSingle: staff.approverSingle ?? null,
      approverMultiple: staff.approverMultiple ?? null,
      approverMultipleMode: staff.approverMultipleMode ?? null,
      shiftGroup: staff.shiftGroup ?? null,
    };
  }, [staff]);
  const [selectedAttendanceIds, setSelectedAttendanceIds] = useState<string[]>(
    []
  );
  const [bulkApproving, setBulkApproving] = useState(false);

  useEffect(() => {
    if (!staffId) return;

    fetchStaff(staffId)
      .then(setStaff)
      .catch(() => {
        dispatch(setSnackbarError(MESSAGE_CODE.E00001));
      });
  }, [staffId, dispatch]);

  useEffect(() => {
    if (attendancesError) {
      dispatch(setSnackbarError(MESSAGE_CODE.E02001));
    }
  }, [attendancesError, dispatch]);

  useEffect(() => {
    if (holidayCalendarsError || companyHolidayCalendarsError) {
      console.error(holidayCalendarsError ?? companyHolidayCalendarsError);
      dispatch(setSnackbarError(MESSAGE_CODE.E00001));
    }
  }, [holidayCalendarsError, companyHolidayCalendarsError, dispatch]);

  const handleEdit = useCallback(
    (workDate: string) => {
      navigate(`/admin/attendances/edit/${workDate}/${staffId}`);
    },
    [navigate, staffId]
  );

  const getBadgeContent = useCallback((attendance: Attendance) => {
    return new ChangeRequest(attendance.changeRequests).getUnapprovedCount();
  }, []);

  const pendingAttendances = useMemo(() => {
    return attendances.filter(
      (a) => new ChangeRequest(a.changeRequests).getUnapprovedCount() > 0
    );
  }, [attendances]);

  const getPendingChangeRequest = useCallback((attendance: Attendance) => {
    return new ChangeRequest(attendance.changeRequests).getFirstUnapproved();
  }, []);

  const handleOpenQuickView = useCallback(
    (attendance: Attendance) => {
      const pendingRequest = getPendingChangeRequest(attendance);
      if (!pendingRequest) return;

      setQuickViewAttendance(attendance);
      setQuickViewChangeRequest(pendingRequest);
      setQuickViewOpen(true);
    },
    [getPendingChangeRequest]
  );

  const handleCloseQuickView = useCallback(() => {
    setQuickViewOpen(false);
    setQuickViewAttendance(null);
    setQuickViewChangeRequest(null);
  }, []);

  const isAttendanceSelected = useCallback(
    (attendanceId: string) => selectedAttendanceIds.includes(attendanceId),
    [selectedAttendanceIds]
  );

  const toggleAttendanceSelection = useCallback((attendanceId: string) => {
    setSelectedAttendanceIds((prev) => {
      if (prev.includes(attendanceId)) {
        return prev.filter((id) => id !== attendanceId);
      }
      return [...prev, attendanceId];
    });
  }, []);

  const toggleSelectAllPending = useCallback(() => {
    if (pendingAttendances.length === 0) return;
    setSelectedAttendanceIds((prev) => {
      if (prev.length === pendingAttendances.length) {
        return [];
      }
      return pendingAttendances.map((attendance) => attendance.id);
    });
  }, [pendingAttendances]);

  const handleBulkApprove = useCallback(async () => {
    if (
      selectedAttendanceIds.length === 0 ||
      !staffId ||
      !staff ||
      !staffForMail
    ) {
      return;
    }

    const targetAttendances = pendingAttendances.filter((attendance) =>
      selectedAttendanceIds.includes(attendance.id)
    );
    if (targetAttendances.length === 0) return;

    setBulkApproving(true);
    try {
      for (const attendance of targetAttendances) {
        // eslint-disable-next-line no-await-in-loop
        const updatedAttendance = await handleApproveChangeRequest(
          attendance,
          (input: UpdateAttendanceInput) =>
            updateAttendanceMutation(input).unwrap(),
          undefined
        );

        new GenericMailSender(
          staffForMail,
          updatedAttendance
        ).approveChangeRequest(undefined);

        // eslint-disable-next-line no-await-in-loop
        await createOperationLogData({
          staffId: staffForMail.id,
          action: "approve_change_request",
          resource: "attendance",
          resourceId: updatedAttendance.id,
          timestamp: new Date().toISOString(),
          details: JSON.stringify({
            workDate: updatedAttendance.workDate,
            applicantStaffId: updatedAttendance.staffId,
            result: "approved",
            comment: null,
            bulk: true,
          }),
        }).catch((error) => {
          console.error("Failed to create operation log:", error);
        });
      }

      dispatch(setSnackbarSuccess(MESSAGE_CODE.S04006));
      setSelectedAttendanceIds([]);
      await refetchAttendances();
    } catch (error) {
      console.error("Bulk approve failed", error);
      dispatch(setSnackbarError(MESSAGE_CODE.E04006));
    } finally {
      setBulkApproving(false);
    }
  }, [
    dispatch,
    refetchAttendances,
    pendingAttendances,
    selectedAttendanceIds,
    staff,
    staffForMail,
    staffId,
    updateAttendanceMutation,
  ]);

  useEffect(() => {
    setSelectedAttendanceIds((prev) =>
      prev.filter((id) =>
        pendingAttendances.some((attendance) => attendance.id === id)
      )
    );
  }, [pendingAttendances]);

  const getTableRowClassNameMemo = useCallback(
    (
      attendance: Attendance,
      holidayCalendars: HolidayCalendar[],
      companyHolidayCalendars: CompanyHolidayCalendar[]
    ) => {
      // 指定休日フラグが立っていれば日曜と同じスタイルにする
      if (staff?.workType === "shift" && attendance.isDeemedHoliday) {
        return "table-row--sunday";
      }

      // Shift勤務のスタッフは土日祝の色付けをしない
      if (staff?.workType === "shift") {
        return "table-row--default";
      }
      return getTableRowClassName(
        attendance,
        holidayCalendars,
        companyHolidayCalendars
      );
    },
    [staff, holidayCalendars, companyHolidayCalendars]
  );

  if (staff === null || !staffId) {
    return (
      <Container maxWidth="xl" sx={{ pt: 2 }}>
        <Typography>データ取得中に何らかの問題が発生しました</Typography>
      </Container>
    );
  }

  if (attendanceLoading || calendarLoading) {
    return (
      <Container maxWidth="xl" sx={{ pt: 2 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Stack spacing={1} sx={{ pt: 1 }}>
        {/* breadcrumbs and main heading removed */}
        <Box>
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
                  `/admin/attendances/edit/${date.format(
                    AttendanceDate.QueryParamFormat
                  )}/${staffId}`
                );
              }
            }}
          />
        </Box>
        <Box>
          <AttendanceGraph attendances={attendances} />
        </Box>
        {pendingAttendances.length > 0 && (
          <Box sx={{ pb: 2 }}>
            {/* 目立たせるために枠と背景で囲む */}
            <Box
              sx={{
                border: "1px solid",
                borderColor: "warning.main",
                borderRadius: 2,
                p: 2,
                backgroundColor: "rgba(255,243,205,0.12)",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                sx={{ mb: 1 }}
              >
                <Typography variant="h6">
                  承認待ち一覧 ({pendingAttendances.length})
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    選択中: {selectedAttendanceIds.length} 件
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={
                      bulkApproving ||
                      selectedAttendanceIds.length === 0 ||
                      !staffForMail
                    }
                    onClick={handleBulkApprove}
                    data-testid="bulk-approve-button"
                  >
                    {bulkApproving ? "承認処理中..." : "選択を一括承認"}
                  </Button>
                </Stack>
              </Stack>
              <Alert severity="warning">
                <AlertTitle sx={{ fontWeight: "bold" }}>
                  確認してください
                </AlertTitle>
                未承認の変更リクエストがあります
              </Alert>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          indeterminate={
                            selectedAttendanceIds.length > 0 &&
                            selectedAttendanceIds.length <
                              pendingAttendances.length
                          }
                          checked={
                            pendingAttendances.length > 0 &&
                            selectedAttendanceIds.length ===
                              pendingAttendances.length
                          }
                          onChange={toggleSelectAllPending}
                          inputProps={{
                            "aria-label": "select all pending change requests",
                          }}
                        />
                      </TableCell>
                      <TableCell />
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        勤務日
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        勤務時間
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        休憩時間(直近)
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>摘要</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        作成日時
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        更新日時
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingAttendances.map((attendance, index) => {
                      const pendingCount = getBadgeContent(attendance);
                      return (
                        <TableRow
                          key={`pending-${index}`}
                          className={getTableRowClassNameMemo(
                            attendance,
                            holidayCalendars,
                            companyHolidayCalendars
                          )}
                          data-testid={
                            index === pendingAttendances.length - 1
                              ? "last-row-pending"
                              : undefined
                          }
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              checked={isAttendanceSelected(attendance.id)}
                              onChange={() =>
                                toggleAttendanceSelection(attendance.id)
                              }
                              inputProps={{
                                "aria-label": "select change request",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <AttendanceStatusTooltip
                                staff={staff}
                                attendance={attendance}
                                holidayCalendars={holidayCalendars}
                                companyHolidayCalendars={
                                  companyHolidayCalendars
                                }
                              />
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleEdit(
                                    dayjs(attendance.workDate).format(
                                      AttendanceDate.QueryParamFormat
                                    )
                                  )
                                }
                                data-testid="edit-attendance"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>

                          {/* 勤務日 */}
                          <WorkDateTableCell
                            workDate={attendance.workDate}
                            holidayCalendars={holidayCalendars}
                            companyHolidayCalendars={companyHolidayCalendars}
                          />

                          {/* 勤務時間 */}
                          <WorkTimeTableCell attendance={attendance} />

                          {/* 休憩時間(最近) */}
                          <RestTimeTableCell attendance={attendance} />

                          {/* 摘要 */}
                          <SummaryTableCell
                            substituteHolidayDate={
                              attendance.substituteHolidayDate
                            }
                            remarks={attendance.remarks}
                            specialHolidayFlag={attendance.specialHolidayFlag}
                            paidHolidayFlag={attendance.paidHolidayFlag}
                            absentFlag={attendance.absentFlag}
                          />

                          {/* 作成日時 */}
                          <CreatedAtTableCell
                            createdAt={attendance.createdAt}
                          />

                          {/* 更新日時 */}
                          <UpdatedAtTableCell
                            updatedAt={attendance.updatedAt}
                          />

                          <TableCell sx={{ width: 1 }} align="right">
                            {pendingCount > 0 && (
                              <Button
                                size="small"
                                variant="contained"
                                color="warning"
                                sx={{ fontWeight: "bold" }}
                                onClick={() => handleOpenQuickView(attendance)}
                                data-testid="quick-view-change-request"
                              >
                                申請確認
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        )}
        <Box sx={{ pb: 5 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell sx={{ whiteSpace: "nowrap" }}>勤務日</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>勤務時間</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    休憩時間(直近)
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>摘要</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>作成日時</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>更新日時</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {attendances.map((attendance, index) => {
                  const pendingCount = getBadgeContent(attendance);
                  return (
                    <TableRow
                      key={index}
                      className={getTableRowClassNameMemo(
                        attendance,
                        holidayCalendars,
                        companyHolidayCalendars
                      )}
                      data-testid={
                        index === attendances.length - 1
                          ? "last-row"
                          : undefined
                      }
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <AttendanceStatusTooltip
                            staff={staff}
                            attendance={attendance}
                            holidayCalendars={holidayCalendars}
                            companyHolidayCalendars={companyHolidayCalendars}
                          />
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleEdit(
                                dayjs(attendance.workDate).format(
                                  AttendanceDate.QueryParamFormat
                                )
                              )
                            }
                            data-testid="edit-attendance-button"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>

                      {/* 勤務日 */}
                      <WorkDateTableCell
                        workDate={attendance.workDate}
                        holidayCalendars={holidayCalendars}
                        companyHolidayCalendars={companyHolidayCalendars}
                      />

                      {/* 勤務時間 */}
                      <WorkTimeTableCell attendance={attendance} />

                      {/* 休憩時間(最近) */}
                      <RestTimeTableCell attendance={attendance} />

                      {/* 摘要 */}
                      <SummaryTableCell
                        substituteHolidayDate={attendance.substituteHolidayDate}
                        remarks={attendance.remarks}
                        // 特別休暇フラグを渡す
                        specialHolidayFlag={attendance.specialHolidayFlag}
                        paidHolidayFlag={attendance.paidHolidayFlag}
                        absentFlag={attendance.absentFlag}
                      />

                      {/* 作成日時 */}
                      <CreatedAtTableCell createdAt={attendance.createdAt} />

                      {/* 更新日時 */}
                      <UpdatedAtTableCell updatedAt={attendance.updatedAt} />

                      <TableCell sx={{ width: 1 }} align="right">
                        {pendingCount > 0 && (
                          <Button
                            size="small"
                            variant="contained"
                            color="warning"
                            sx={{ fontWeight: "bold" }}
                            onClick={() => handleOpenQuickView(attendance)}
                            data-testid="quick-view-change-request"
                          >
                            申請確認
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Stack>
      <ChangeRequestQuickViewDialog
        open={quickViewOpen}
        attendance={quickViewAttendance}
        changeRequest={quickViewChangeRequest}
        onClose={handleCloseQuickView}
      />
    </Container>
  );
}
