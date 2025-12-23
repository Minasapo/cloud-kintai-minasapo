import "./styles.scss";

import { AttendanceStatusTooltip } from "@features/attendance/list/AttendanceStatusTooltip";
import { useAdminStaffAttendanceListViewModel } from "@/features/admin/staffAttendanceList/useAdminStaffAttendanceListViewModel";
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
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";

import { AttendanceDate } from "@/lib/AttendanceDate";

import { AttendanceGraph } from "./AttendanceGraph";
import ChangeRequestQuickViewDialog from "./ChangeRequestQuickViewDialog";
import { CreatedAtTableCell } from "./CreatedAtTableCell";
import { RestTimeTableCell } from "./RestTimeTableCell";
import { SummaryTableCell } from "./SummaryTableCell";
import { UpdatedAtTableCell } from "./UpdatedAtTableCell";
import { WorkDateTableCell } from "./WorkDateTableCell";
import { WorkTimeTableCell } from "./WorkTimeTableCell";

export default function AdminStaffAttendanceList() {
  const { staffId } = useParams();
  const navigate = useNavigate();

  const {
    staff,
    holidayCalendars,
    companyHolidayCalendars,
    calendarLoading,
    attendances,
    attendanceLoading,
    pendingAttendances,
    quickViewAttendance,
    quickViewChangeRequest,
    quickViewOpen,
    handleOpenQuickView,
    handleCloseQuickView,
    selectedAttendanceIds,
    isAttendanceSelected,
    toggleAttendanceSelection,
    toggleSelectAllPending,
    bulkApproving,
    canBulkApprove,
    handleBulkApprove,
    getTableRowClassName,
    getBadgeContent,
  } = useAdminStaffAttendanceListViewModel(staffId);

  const handleEdit = (workDate: string) => {
    navigate(`/admin/attendances/edit/${workDate}/${staffId}`);
  };

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
                      !canBulkApprove
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
                          className={getTableRowClassName(
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
                      className={getTableRowClassName(
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
