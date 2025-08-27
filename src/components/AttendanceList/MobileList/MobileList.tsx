import "./styles.scss";

import {
  Alert,
  AlertTitle,
  Box,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { AttendanceState, AttendanceStatus } from "@/lib/AttendanceState";
import { AttendanceGraph } from "@/pages/admin/AdminStaffAttendanceList/AttendanceGraph";

import {
  Attendance,
  CompanyHolidayCalendar,
  HolidayCalendar,
  Staff,
} from "../../../API";
import TableBodyRow from "./TableBodyRow";

const MobileBox = styled(Box)(({ theme }) => ({
  padding: "0px 0px 40px 0px",
  [theme.breakpoints.up("md")]: {
    display: "none",
  },
}));

export default function MobileList({
  attendances,
  holidayCalendars,
  companyHolidayCalendars,
  staff,
}: {
  attendances: Attendance[];
  holidayCalendars: HolidayCalendar[];
  companyHolidayCalendars: CompanyHolidayCalendar[];
  staff: Staff | null | undefined;
}) {
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
    <MobileBox>
      <AttendanceGraph attendances={attendances} />
      {errorAttendances.length > 0 && (
        <Box sx={{ pb: 2, pt: 2 }}>
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
                    <TableBodyRow
                      key={`error-${index}`}
                      attendance={attendance}
                      holidayCalendars={holidayCalendars}
                      companyHolidayCalendars={companyHolidayCalendars}
                      staff={staff}
                    />
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
              <TableBodyRow
                key={index}
                attendance={attendance}
                holidayCalendars={holidayCalendars}
                companyHolidayCalendars={companyHolidayCalendars}
                staff={staff}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </MobileBox>
  );
}
