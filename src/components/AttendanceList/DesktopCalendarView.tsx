import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  Box,
  Chip,
  Divider,
  IconButton,
  Stack,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import { NavigateFunction } from "react-router-dom";

import {
  Attendance,
  CompanyHolidayCalendar,
  HolidayCalendar,
  Staff,
} from "@/API";
import { AttendanceDate } from "@/lib/AttendanceDate";
import { AttendanceState, AttendanceStatus } from "@/lib/AttendanceState";
import { CompanyHoliday } from "@/lib/CompanyHoliday";
import { Holiday } from "@/lib/Holiday";
import { calcTotalRestTime } from "@/pages/AttendanceEdit/DesktopEditor/RestTimeItem/RestTimeInput/RestTimeInput";
import { calcTotalWorkTime } from "@/pages/AttendanceEdit/DesktopEditor/WorkTimeInput/WorkTimeInput";

const DAYS_OF_WEEK = ["日", "月", "火", "水", "木", "金", "土"];

const CalendarWrapper = styled(Box)(({ theme }) => ({
  padding: "0px 40px 32px 40px",
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const CalendarGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: theme.spacing(1),
}));

const DayCell = styled(Box, {
  shouldForwardProp: (prop) =>
    !["$isCurrentMonth", "$isToday", "$isHoliday"].includes(String(prop)),
})<{
  $isCurrentMonth: boolean;
  $isToday: boolean;
  $isHoliday: boolean;
}>(({ theme, $isCurrentMonth, $isToday, $isHoliday }) => ({
  minHeight: 140,
  borderRadius: 12,
  padding: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  opacity: $isCurrentMonth ? 1 : 0.4,
  backgroundColor: $isToday
    ? theme.palette.action.hover
    : $isHoliday
    ? theme.palette.action.selected
    : theme.palette.background.default,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  transition: "background-color 0.2s ease",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const statusLabelMap: Record<AttendanceStatus, string> = {
  [AttendanceStatus.Ok]: "OK",
  [AttendanceStatus.Error]: "要確認",
  [AttendanceStatus.Requesting]: "申請中",
  [AttendanceStatus.Late]: "遅刻",
  [AttendanceStatus.Working]: "勤務中",
  [AttendanceStatus.None]: "",
};

const statusChipColor: Record<
  AttendanceStatus,
  "default" | "success" | "error" | "warning" | "info"
> = {
  [AttendanceStatus.Ok]: "success",
  [AttendanceStatus.Error]: "error",
  [AttendanceStatus.Requesting]: "warning",
  [AttendanceStatus.Late]: "error",
  [AttendanceStatus.Working]: "info",
  [AttendanceStatus.None]: "default",
};

function buildWeeks(targetMonth: Dayjs) {
  const monthStart = targetMonth.startOf("month").startOf("week");
  const monthEnd = targetMonth.endOf("month").endOf("week");
  const days: Dayjs[] = [];

  let cursor = monthStart;
  while (cursor.isBefore(monthEnd) || cursor.isSame(monthEnd, "day")) {
    days.push(cursor);
    cursor = cursor.add(1, "day");
  }

  const weeks: Dayjs[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

function getNetWorkingHours(attendance: Attendance | undefined) {
  if (!attendance) return 0;
  if (!attendance.startTime) return 0;

  const workTime = calcTotalWorkTime(attendance.startTime, attendance.endTime);
  const totalRest = getTotalRestHours(attendance);

  return Math.max(workTime - totalRest, 0);
}

function getTotalRestHours(attendance: Attendance | undefined) {
  if (!attendance?.rests) return 0;

  const totalRest = (attendance.rests || [])
    .filter((rest): rest is NonNullable<typeof rest> => !!rest)
    .reduce((acc, rest) => {
      if (!rest.startTime) return acc;
      return acc + calcTotalRestTime(rest.startTime, rest.endTime);
    }, 0);

  return totalRest;
}

function formatTimeRange(attendance: Attendance | undefined) {
  if (!attendance) return undefined;

  const format = (value?: string | null) =>
    value ? dayjs(value).format("HH:mm") : undefined;

  const start = format(attendance.startTime || undefined);
  const end = format(attendance.endTime || undefined);

  if (!start && !end) {
    return undefined;
  }

  return `${start ?? ""} - ${end ?? ""}`.trim();
}

function getStatus(
  attendance: Attendance | undefined,
  staff: Staff | null | undefined,
  holidayCalendars: HolidayCalendar[],
  companyHolidayCalendars: CompanyHolidayCalendar[]
) {
  if (!attendance || !staff) return AttendanceStatus.None;

  return new AttendanceState(
    staff,
    attendance,
    holidayCalendars,
    companyHolidayCalendars
  ).get();
}

function isHolidayLike(
  date: Dayjs,
  staff: Staff | null | undefined,
  holidayCalendars: HolidayCalendar[],
  companyHolidayCalendars: CompanyHolidayCalendar[]
) {
  if (staff?.workType === "shift") {
    return Boolean(
      new CompanyHoliday(
        companyHolidayCalendars,
        date.format(AttendanceDate.DataFormat)
      ).isHoliday()
    );
  }

  const workDate = date.format(AttendanceDate.DataFormat);
  const isHoliday = new Holiday(holidayCalendars, workDate).isHoliday();
  const isCompanyHoliday = new CompanyHoliday(
    companyHolidayCalendars,
    workDate
  ).isHoliday();

  return isHoliday || isCompanyHoliday || [0, 6].includes(date.day());
}

function getHolidayNames(
  date: Dayjs,
  holidayCalendars: HolidayCalendar[],
  companyHolidayCalendars: CompanyHolidayCalendar[]
) {
  const workDate = date.format(AttendanceDate.DataFormat);
  const holiday = new Holiday(holidayCalendars, workDate).getHoliday();
  const companyHoliday = new CompanyHoliday(
    companyHolidayCalendars,
    workDate
  ).getHoliday();

  return {
    holidayName: holiday?.name,
    companyHolidayName: companyHoliday?.name,
  };
}

type Props = {
  attendances: Attendance[];
  staff: Staff | null | undefined;
  holidayCalendars: HolidayCalendar[];
  companyHolidayCalendars: CompanyHolidayCalendar[];
  navigate: NavigateFunction;
};

export default function DesktopCalendarView({
  attendances,
  staff,
  holidayCalendars,
  companyHolidayCalendars,
  navigate,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf("month"));

  const attendanceMap = useMemo(() => {
    return attendances.reduce((map, attendance) => {
      if (attendance.workDate) {
        map.set(attendance.workDate, attendance);
      }
      return map;
    }, new Map<string, Attendance>());
  }, [attendances]);

  const weeks = useMemo(() => buildWeeks(currentMonth), [currentMonth]);

  const handleMoveMonth = (offset: number) => {
    setCurrentMonth((prev) => prev.add(offset, "month"));
  };

  const handleDayClick = (date: Dayjs) => {
    const formatted = date.format(AttendanceDate.QueryParamFormat);
    navigate(`/attendance/${formatted}/edit`);
  };

  return (
    <CalendarWrapper>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton
            aria-label="previous-month"
            onClick={() => handleMoveMonth(-1)}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            aria-label="next-month"
            onClick={() => handleMoveMonth(1)}
          >
            <ChevronRightIcon />
          </IconButton>
          <Divider orientation="vertical" flexItem />
          <Typography variant="h6">
            {currentMonth.format("YYYY年M月")}
          </Typography>
        </Stack>
        <Box>
          <Tooltip title="今月に戻る">
            <IconButton
              onClick={() => setCurrentMonth(dayjs().startOf("month"))}
            >
              <Typography variant="body2">今月</Typography>
            </IconButton>
          </Tooltip>
        </Box>
      </Stack>

      <CalendarGrid sx={{ mb: 1 }}>
        {DAYS_OF_WEEK.map((label, index) => (
          <Typography
            key={label}
            variant="subtitle2"
            align="center"
            sx={{
              color:
                index === 0
                  ? "error.main"
                  : index === 6
                  ? "info.main"
                  : "text.secondary",
            }}
          >
            {label}
          </Typography>
        ))}
      </CalendarGrid>

      <Stack spacing={1.5}>
        {weeks.map((week, weekIndex) => (
          <CalendarGrid key={`week-${weekIndex}`}>
            {week.map((date) => {
              const workDate = date.format(AttendanceDate.DataFormat);
              const attendance = attendanceMap.get(workDate);
              const status = getStatus(
                attendance,
                staff,
                holidayCalendars,
                companyHolidayCalendars
              );
              const netHours = getNetWorkingHours(attendance);
              const totalRestHours = getTotalRestHours(attendance);
              const timeRangeLabel = attendance
                ? formatTimeRange(attendance)
                : undefined;
              const isToday = date.isSame(dayjs(), "day");
              const isCurrentMonth = date.isSame(currentMonth, "month");
              const holidayLike = isHolidayLike(
                date,
                staff,
                holidayCalendars,
                companyHolidayCalendars
              );
              const { holidayName, companyHolidayName } = getHolidayNames(
                date,
                holidayCalendars,
                companyHolidayCalendars
              );
              const holidayLabels = [
                holidayName,
                companyHolidayName
                  ? `会社休日 ${companyHolidayName}`
                  : undefined,
              ].filter((label): label is string => Boolean(label));

              return (
                <DayCell
                  key={workDate}
                  onClick={() => handleDayClick(date)}
                  $isCurrentMonth={isCurrentMonth}
                  $isToday={isToday}
                  $isHoliday={holidayLike}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {date.date()}
                    </Typography>
                    {status !== AttendanceStatus.None && (
                      <Chip
                        size="small"
                        label={statusLabelMap[status]}
                        color={statusChipColor[status]}
                      />
                    )}
                  </Stack>
                  {timeRangeLabel && (
                    <Typography variant="caption" color="text.secondary">
                      {timeRangeLabel}
                    </Typography>
                  )}
                  {attendance?.paidHolidayFlag ? (
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      有給休暇
                    </Typography>
                  ) : (
                    netHours > 0 && (
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {`${netHours.toFixed(1)}h`}
                      </Typography>
                    )
                  )}
                  {attendance &&
                    !attendance.paidHolidayFlag &&
                    totalRestHours > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        {`休憩 ${totalRestHours.toFixed(1)}h`}
                      </Typography>
                    )}
                  {attendance?.remarks && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {attendance.remarks}
                    </Typography>
                  )}
                  {holidayLabels.map((label) => (
                    <Typography
                      key={label}
                      variant="caption"
                      color="error.main"
                      sx={{ fontWeight: "bold" }}
                    >
                      {label}
                    </Typography>
                  ))}
                </DayCell>
              );
            })}
          </CalendarGrid>
        ))}
      </Stack>
    </CalendarWrapper>
  );
}
