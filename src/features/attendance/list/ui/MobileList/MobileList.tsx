import "./styles.scss";

import { Alert, AlertTitle, Box, styled } from "@mui/material";
import {
  Attendance,
  CloseDate,
  CompanyHolidayCalendar,
  HolidayCalendar,
  Staff,
} from "@shared/api/graphql/types";
import dayjs, { Dayjs } from "dayjs";

import { AttendanceStatus } from "@/entities/attendance/lib/AttendanceState";

import { getStatus } from "../../lib/attendanceStatusUtils";
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
  closeDates,
}: {
  attendances: Attendance[];
  holidayCalendars: HolidayCalendar[];
  companyHolidayCalendars: CompanyHolidayCalendar[];
  staff: Staff | null | undefined;
  currentMonth: Dayjs;
  onMonthChange?: (newMonth: Dayjs) => void;
  closeDates?: CloseDate[];
}) {
  const hasErrorStatus = (() => {
    if (!staff) return false;
    const today = dayjs();

    // 月の最初と最後を取得
    const monthStart = currentMonth.startOf("month");
    const monthEnd = currentMonth.endOf("month");

    // 該当月のすべての日付をチェック
    let current = monthStart;

    while (current.isBefore(monthEnd) || current.isSame(monthEnd, "day")) {
      // 未来の日付はスキップ
      if (current.isAfter(today, "day")) {
        current = current.add(1, "day");
        continue;
      }

      // その日付の打刻データを探す
      const attendance = attendances.find((a) =>
        dayjs(a.workDate).isSame(current, "day")
      );

      // カレンダーと同じロジックで状態を判定
      const status = getStatus(
        attendance,
        staff,
        holidayCalendars,
        companyHolidayCalendars,
        current
      );

      if (
        status === AttendanceStatus.Error ||
        status === AttendanceStatus.Late
      ) {
        return true;
      }

      current = current.add(1, "day");
    }

    return false;
  })();

  return (
    <MobileBox>
      {hasErrorStatus && (
        <Box sx={{ pb: 2 }}>
          <Alert severity="warning">
            <AlertTitle sx={{ fontWeight: "bold" }}>打刻エラー</AlertTitle>
            カレンダー上で赤色の日付をタップして確認してください
          </Alert>
        </Box>
      )}
      <MobileCalendar
        attendances={attendances}
        holidayCalendars={holidayCalendars}
        companyHolidayCalendars={companyHolidayCalendars}
        staff={staff}
        currentMonth={currentMonth}
        onMonthChange={onMonthChange}
        closeDates={closeDates}
      />
    </MobileBox>
  );
}
