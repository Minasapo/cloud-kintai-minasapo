import { AttendanceStatusTooltip } from "@features/attendance/list/AttendanceStatusTooltip";
import {
  AttendanceRowVariant,
  attendanceRowVariantStyles,
} from "@features/attendance/list/getAttendanceRowClassName";
import EditIcon from "@mui/icons-material/Edit";
import {
  Button,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Attendance,
  CompanyHolidayCalendar,
  HolidayCalendar,
  Staff,
} from "@shared/api/graphql/types";

import { CreatedAtTableCell } from "@/pages/admin/AdminStaffAttendanceList/CreatedAtTableCell";
import { RestTimeTableCell } from "@/pages/admin/AdminStaffAttendanceList/RestTimeTableCell";
import { SummaryTableCell } from "@/pages/admin/AdminStaffAttendanceList/SummaryTableCell";
import { UpdatedAtTableCell } from "@/pages/admin/AdminStaffAttendanceList/UpdatedAtTableCell";
import { WorkDateTableCell } from "@/pages/admin/AdminStaffAttendanceList/WorkDateTableCell";
import { WorkTimeTableCell } from "@/pages/admin/AdminStaffAttendanceList/WorkTimeTableCell";

export type AttendanceTableSectionProps = {
  attendances: Attendance[];
  staff: Staff | null | undefined;
  holidayCalendars: HolidayCalendar[];
  companyHolidayCalendars: CompanyHolidayCalendar[];
  onEdit: (attendance: Attendance) => void;
  getBadgeContent: (attendance: Attendance) => number;
  onOpenQuickView: (attendance: Attendance) => void;
  getRowVariant: (
    attendance: Attendance,
    holidayCalendars?: HolidayCalendar[],
    companyHolidayCalendars?: CompanyHolidayCalendar[]
  ) => AttendanceRowVariant;
};

export function AttendanceTableSection({
  attendances,
  staff,
  holidayCalendars,
  companyHolidayCalendars,
  onEdit,
  getBadgeContent,
  onOpenQuickView,
  getRowVariant,
}: AttendanceTableSectionProps) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell sx={{ whiteSpace: "nowrap" }}>勤務日</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>勤務時間</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>休憩時間(直近)</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>摘要</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>作成日時</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>更新日時</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {attendances.map((attendance, index) => {
            const badgeContent = getBadgeContent(attendance);
            const rowVariant = getRowVariant(
              attendance,
              holidayCalendars,
              companyHolidayCalendars
            );
            return (
              <TableRow
                key={index}
                sx={attendanceRowVariantStyles[rowVariant]}
                data-testid={
                  index === attendances.length - 1 ? "last-row" : undefined
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
                      onClick={() => onEdit(attendance)}
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
                  specialHolidayFlag={attendance.specialHolidayFlag}
                  paidHolidayFlag={attendance.paidHolidayFlag}
                  absentFlag={attendance.absentFlag}
                />

                {/* 作成日時 */}
                <CreatedAtTableCell createdAt={attendance.createdAt} />

                {/* 更新日時 */}
                <UpdatedAtTableCell updatedAt={attendance.updatedAt} />

                <TableCell sx={{ width: 1 }} align="right">
                  {badgeContent > 0 && (
                    <Button
                      size="small"
                      variant="contained"
                      color="warning"
                      sx={{ fontWeight: "bold" }}
                      onClick={() => onOpenQuickView(attendance)}
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
  );
}
