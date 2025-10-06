import { TableHead } from "@aws-amplify/ui-react";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  AlertTitle,
  Box,
  IconButton,
  Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { NavigateFunction } from "react-router-dom";

import { AttendanceDate } from "@/lib/AttendanceDate";
import { AttendanceState, AttendanceStatus } from "@/lib/AttendanceState";
import { getTableRowClassName } from "@/pages/admin/AdminStaffAttendanceList/AdminStaffAttendanceList";
import { AttendanceGraph } from "@/pages/admin/AdminStaffAttendanceList/AttendanceGraph";
import { CreatedAtTableCell } from "@/pages/admin/AdminStaffAttendanceList/CreatedAtTableCell";
import { RestTimeTableCell } from "@/pages/admin/AdminStaffAttendanceList/RestTimeTableCell";
import { SummaryTableCell } from "@/pages/admin/AdminStaffAttendanceList/SummaryTableCell";
import { UpdatedAtTableCell } from "@/pages/admin/AdminStaffAttendanceList/UpdatedAtTableCell";
import { WorkDateTableCell } from "@/pages/admin/AdminStaffAttendanceList/WorkDateTableCell";
import { WorkTimeTableCell } from "@/pages/admin/AdminStaffAttendanceList/WorkTimeTableCell";

import {
  Attendance,
  CompanyHolidayCalendar,
  HolidayCalendar,
  Staff,
} from "../../API";
import { AttendanceStatusTooltip } from "./AttendanceStatusTooltip";

const DesktopBox = styled(Box)(({ theme }) => ({
  padding: "0px 40px 40px 40px",
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

export default function DesktopList({
  attendances,
  staff,
  holidayCalendars,
  companyHolidayCalendars,
  navigate,
}: {
  attendances: Attendance[];
  staff: Staff | null | undefined;
  holidayCalendars: HolidayCalendar[];
  companyHolidayCalendars: CompanyHolidayCalendar[];
  navigate: NavigateFunction;
}) {
  const getRowClass = (attendance: Attendance) => {
    if (staff?.workType === "shift" && attendance.isDeemedHoliday) {
      return "table-row--sunday";
    }

    // シフト勤務のスタッフは土日祝の色付けをしない
    if (staff?.workType === "shift") {
      return "table-row--default";
    }

    return getTableRowClassName(
      attendance,
      holidayCalendars,
      companyHolidayCalendars
    );
  };
  const handleEdit = (attendance: Attendance) => {
    const { workDate } = attendance;
    const formattedWorkDate = dayjs(workDate).format(
      AttendanceDate.QueryParamFormat
    );
    navigate(`/attendance/${formattedWorkDate}/edit`);
  };

  const errorAttendances = (() => {
    if (!staff) return [] as Attendance[];
    return attendances.filter((a) => {
      const hasSystemComment =
        Array.isArray(a.systemComments) && a.systemComments.length > 0;
      if (hasSystemComment) return true;
      const status = new AttendanceState(
        staff,
        a,
        holidayCalendars,
        companyHolidayCalendars
      ).get();
      return (
        status === AttendanceStatus.Error || status === AttendanceStatus.Late
      );
    });
  })();
  return (
    <DesktopBox>
      <AttendanceGraph attendances={attendances} />
      {errorAttendances.length > 0 && (
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
              打刻エラー一覧 ({errorAttendances.length})
            </Typography>
            <Alert severity="warning">
              <AlertTitle sx={{ fontWeight: "bold" }}>
                確認してください
              </AlertTitle>
              打刻エラーがあります
            </Alert>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell sx={{ whiteSpace: "nowrap" }}>勤務日</TableCell>
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
                  {errorAttendances.map((attendance, index) => (
                    <TableRow
                      key={`error-${index}`}
                      className={getRowClass(attendance)}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={0} alignItems="center">
                          <AttendanceStatusTooltip
                            staff={staff}
                            attendance={attendance}
                            holidayCalendars={holidayCalendars}
                            companyHolidayCalendars={companyHolidayCalendars}
                          />
                          <IconButton onClick={() => handleEdit(attendance)}>
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
                        paidHolidayFlag={attendance.paidHolidayFlag}
                        substituteHolidayDate={attendance.substituteHolidayDate}
                        remarks={attendance.remarks}
                        specialHolidayFlag={attendance.specialHolidayFlag}
                        absentFlag={attendance.absentFlag}
                      />

                      {/* 作成日時 */}
                      <CreatedAtTableCell createdAt={attendance.createdAt} />

                      {/* 更新日時 */}
                      <UpdatedAtTableCell updatedAt={attendance.updatedAt} />

                      <TableCell sx={{ width: 1 }} />
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
            {attendances.map((attendance, index) => (
              <TableRow key={index} className={getRowClass(attendance)}>
                <TableCell>
                  <Stack direction="row" spacing={0} alignItems="center">
                    <AttendanceStatusTooltip
                      staff={staff}
                      attendance={attendance}
                      holidayCalendars={holidayCalendars}
                      companyHolidayCalendars={companyHolidayCalendars}
                    />
                    <IconButton onClick={() => handleEdit(attendance)}>
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
                  paidHolidayFlag={attendance.paidHolidayFlag}
                  substituteHolidayDate={attendance.substituteHolidayDate}
                  remarks={attendance.remarks}
                  specialHolidayFlag={attendance.specialHolidayFlag}
                  absentFlag={attendance.absentFlag}
                />

                {/* 作成日時 */}
                <CreatedAtTableCell createdAt={attendance.createdAt} />

                {/* 更新日時 */}
                <UpdatedAtTableCell updatedAt={attendance.updatedAt} />

                <TableCell sx={{ width: 1 }} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DesktopBox>
  );
}
