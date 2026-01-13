import "./styles.scss";

import { Alert, AlertTitle, Box, styled } from "@mui/material";
import {
  Attendance,
  CompanyHolidayCalendar,
  HolidayCalendar,
  Staff,
} from "@shared/api/graphql/types";
import { Dayjs } from "dayjs";

import { AttendanceState, AttendanceStatus } from "@/lib/AttendanceState";

import MobileCalendar from "./MobileCalendar";

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
  currentMonth,
  onMonthChange,
}: {
  attendances: Attendance[];
  holidayCalendars: HolidayCalendar[];
  companyHolidayCalendars: CompanyHolidayCalendar[];
  staff: Staff | null | undefined;
  currentMonth: Dayjs;
  onMonthChange?: (newMonth: Dayjs) => void;
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
      <MobileCalendar
        attendances={attendances}
        holidayCalendars={holidayCalendars}
        companyHolidayCalendars={companyHolidayCalendars}
        staff={staff}
        currentMonth={currentMonth}
        onMonthChange={onMonthChange}
      />
      {errorAttendances.length > 0 && (
        <Box sx={{ pb: 2, pt: 2 }}>
          <Alert severity="warning">
            <AlertTitle sx={{ fontWeight: "bold" }}>
              打刻エラー ({errorAttendances.length}件)
            </AlertTitle>
            カレンダー上で赤色の日付をタップして確認してください
          </Alert>
        </Box>
      )}
    </MobileBox>
  );
}
