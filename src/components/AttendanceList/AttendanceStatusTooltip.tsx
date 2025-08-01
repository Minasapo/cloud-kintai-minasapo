import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import { Box, Tooltip } from "@mui/material";

import { AttendanceState, AttendanceStatus } from "@/lib/AttendanceState";

import {
  Attendance,
  CompanyHolidayCalendar,
  HolidayCalendar,
  Staff,
} from "../../API";

export function AttendanceStatusTooltip({
  staff,
  attendance,
  holidayCalendars,
  companyHolidayCalendars,
}: {
  staff: Staff | null | undefined;
  attendance: Attendance;
  holidayCalendars: HolidayCalendar[];
  companyHolidayCalendars: CompanyHolidayCalendar[];
}) {
  if (!staff) {
    return <DefaultTooltip />;
  }

  // systemCommentsがある場合の判定
  const hasSystemComment =
    Array.isArray(attendance.systemComments) &&
    attendance.systemComments.length > 0;
  if (hasSystemComment) {
    return (
      <Tooltip title="システムコメントがあります">
        <ErrorIcon color="error" />
      </Tooltip>
    );
  }

  const attendanceState = new AttendanceState(
    staff,
    attendance,
    holidayCalendars,
    companyHolidayCalendars
  ).get();

  if (attendanceState === "") {
    return <DefaultTooltip />;
  }

  switch (attendanceState) {
    case AttendanceStatus.Ok:
    case AttendanceStatus.Working:
      return <CheckCircleIcon color="success" />;
    case AttendanceStatus.Requesting:
      return <RequestingTooltip />;
    case AttendanceStatus.Late:
    case AttendanceStatus.Error:
      return <ErrorTooltip />;

    default:
      return <DefaultTooltip />;
  }
}

function DefaultTooltip() {
  return <Box width={24} height={24} />;
}

function RequestingTooltip() {
  return (
    <Tooltip title="申請中です。承認されるまで反映されません">
      <HourglassTopIcon color="warning" />
    </Tooltip>
  );
}

function ErrorTooltip() {
  return (
    <Tooltip title="勤怠に不備があります">
      <ErrorIcon color="error" />
    </Tooltip>
  );
}
