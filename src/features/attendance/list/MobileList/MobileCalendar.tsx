/**
 * モバイル用カレンダー表示コンポーネント
 * スタッフの勤怠情報をカレンダー形式で表示する
 */
import {
  Box,
  Button,
  IconButton,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  Attendance,
  CompanyHolidayCalendar,
  HolidayCalendar,
  Staff,
} from "@shared/api/graphql/types";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AttendanceDate } from "@/lib/AttendanceDate";
import { AttendanceState, AttendanceStatus } from "@/lib/AttendanceState";

const CalendarContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const DayOfWeekHeader = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: "2px",
  marginBottom: theme.spacing(0.5),
  padding: theme.spacing(0.5, 0),
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
}));

const DayOfWeekCell = styled(Typography)(({ theme }) => ({
  textAlign: "center",
  fontWeight: "bold",
  fontSize: "0.625rem",
  color: theme.palette.text.secondary,
}));

const CalendarGrid = styled(Box)(() => ({
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: "2px",
}));

interface CalendarDayProps {
  isCurrentMonth: boolean;
  hasError: boolean;
  status?: AttendanceStatus;
}

interface CalendarDayCellFullProps extends CalendarDayProps {
  isSelected?: boolean;
}

const CalendarDayCell = styled(Box)<CalendarDayCellFullProps>(
  ({ theme, isCurrentMonth, hasError, status, isSelected }) => {
    let backgroundColor = isCurrentMonth
      ? theme.palette.background.paper
      : theme.palette.grey[50];
    let borderColor = theme.palette.divider;
    let color = isCurrentMonth
      ? theme.palette.text.primary
      : theme.palette.text.secondary;

    if (status === AttendanceStatus.Error || hasError) {
      backgroundColor = theme.palette.error.light;
      color = theme.palette.error.dark;
      borderColor = theme.palette.error.main;
    } else if (status === AttendanceStatus.Late) {
      backgroundColor = theme.palette.warning.light;
      color = theme.palette.warning.dark;
      borderColor = theme.palette.warning.main;
    } else if (status === AttendanceStatus.None) {
      backgroundColor = theme.palette.grey[200];
      color = theme.palette.text.secondary;
    }

    if (isSelected) {
      borderColor = theme.palette.primary.main;
    }

    return {
      minHeight: "48px",
      border: isSelected
        ? `2px solid ${borderColor}`
        : `1px solid ${borderColor}`,
      borderRadius: "4px",
      padding: "2px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "stretch",
      cursor: isCurrentMonth ? "pointer" : "default",
      backgroundColor,
      color,
      transition: "all 0.2s ease",
      overflow: "hidden",
      "&:hover": isCurrentMonth
        ? {
            boxShadow: theme.shadows[1],
            transform: "scale(1.02)",
          }
        : {},
    };
  }
);

const DayNumber = styled(Typography)({
  fontSize: "0.75rem",
  fontWeight: "bold",
  lineHeight: 1,
  marginBottom: "2px",
});

const HolidayName = styled(Typography)({
  fontSize: "0.45rem",
  lineHeight: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  color: "#d32f2f",
  marginBottom: "2px",
});

const TimeDisplay = styled(Typography)({
  fontSize: "0.5rem",
  lineHeight: 1.2,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const StatusIndicator = styled(Box)<{ status?: AttendanceStatus }>(
  ({ theme, status }) => ({
    width: "3px",
    height: "3px",
    borderRadius: "50%",
    flexShrink: 0,
    backgroundColor: (() => {
      switch (status) {
        case AttendanceStatus.Error:
          return theme.palette.error.main;
        case AttendanceStatus.Late:
          return theme.palette.warning.main;
        case AttendanceStatus.None:
          return theme.palette.grey[400];
        case AttendanceStatus.Ok:
          return theme.palette.success.main;
        default:
          return theme.palette.grey[300];
      }
    })(),
  })
);

interface MobileCalendarProps {
  attendances: Attendance[];
  holidayCalendars: HolidayCalendar[];
  companyHolidayCalendars: CompanyHolidayCalendar[];
  staff: Staff | null | undefined;
  currentMonth: Dayjs;
  onMonthChange?: (newMonth: Dayjs) => void;
}

export default function MobileCalendar({
  attendances,
  holidayCalendars,
  companyHolidayCalendars,
  staff,
  currentMonth,
  onMonthChange,
}: MobileCalendarProps) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const today = dayjs();
    // 今日の日付が表示中の月に含まれる場合のみ選択状態にする
    return today.isSame(currentMonth, "month")
      ? today.format("YYYY-MM-DD")
      : null;
  });

  // 月が変更された時に今日の日付を選択
  useEffect(() => {
    const today = dayjs();
    if (today.isSame(currentMonth, "month")) {
      setSelectedDate(today.format("YYYY-MM-DD"));
    } else {
      setSelectedDate(null);
    }
  }, [currentMonth]);

  // 月の最初の日を取得
  const monthStart = currentMonth.startOf("month");
  // 月の最後の日を取得
  const monthEnd = currentMonth.endOf("month");
  // 前月の末日から必要な日数を取得
  const startDate = monthStart.subtract(monthStart.day(), "day");
  // 次月の初日まで続ける
  const endDate = monthEnd.add(6 - monthEnd.day(), "day");

  // 勤怠データを日付でマッピング
  const attendanceMap = new Map<string, Attendance>();
  attendances.forEach((a) => {
    const dateKey = dayjs(a.workDate).format("YYYY-MM-DD");
    attendanceMap.set(dateKey, a);
  });

  // カレンダーの日付配列を生成
  const days: { date: Dayjs; isCurrentMonth: boolean }[] = [];
  let current = startDate.clone();
  while (current.isBefore(endDate) || current.isSame(endDate, "day")) {
    days.push({
      date: current.clone(),
      isCurrentMonth: current.isSame(monthStart, "month"),
    });
    current = current.add(1, "day");
  }

  const handleDateClick = (date: Dayjs) => {
    const dateKey = date.format("YYYY-MM-DD");
    setSelectedDate(selectedDate === dateKey ? null : dateKey);
  };

  const handleEdit = (date: string) => {
    const dateStr = dayjs(date).format(AttendanceDate.QueryParamFormat);
    navigate(`/attendance/${dateStr}/edit`);
  };

  // 祝祭日判定のヘルパー関数
  const getHolidayInfo = (date: Dayjs) => {
    const dateStr = date.format("YYYY-MM-DD");

    // 国民の祝日
    const holiday = holidayCalendars.find((h) => h.holidayDate === dateStr);
    if (holiday) {
      return { name: holiday.name || "祝日", type: "holiday" as const };
    }

    // 会社休日
    const companyHoliday = companyHolidayCalendars.find(
      (h) => h.holidayDate === dateStr
    );
    if (companyHoliday) {
      return {
        name: companyHoliday.name || "会社休日",
        type: "company" as const,
      };
    }

    return null;
  };

  const selectedAttendance = selectedDate
    ? attendanceMap.get(selectedDate)
    : null;
  const selectedDateStatus =
    selectedAttendance && staff
      ? new AttendanceState(
          staff,
          selectedAttendance,
          holidayCalendars,
          companyHolidayCalendars
        ).get()
      : undefined;

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <CalendarContainer>
      {/* 月の移動ヘッダー */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <IconButton
          size="small"
          onClick={() => onMonthChange?.(currentMonth.subtract(1, "month"))}
          aria-label="前月"
        >
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {currentMonth.format("YYYY年M月")}
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              const today = dayjs();
              onMonthChange?.(today);
              setSelectedDate(today.format("YYYY-MM-DD"));
            }}
            sx={{ fontSize: "0.75rem", py: 0.5, px: 1 }}
          >
            今日
          </Button>
          <IconButton
            size="small"
            onClick={() => onMonthChange?.(currentMonth.add(1, "month"))}
            aria-label="次月"
          >
            <ChevronRightIcon />
          </IconButton>
        </Stack>
      </Stack>

      <DayOfWeekHeader>
        {weekDays.map((day, index) => (
          <DayOfWeekCell key={`dow-${index}`}>{day}</DayOfWeekCell>
        ))}
      </DayOfWeekHeader>

      <CalendarGrid>
        {days.map((day, index) => {
          const dateKey = day.date.format("YYYY-MM-DD");
          const attendance = attendanceMap.get(dateKey);
          const holidayInfo = getHolidayInfo(day.date);

          let status: AttendanceStatus | undefined;
          let hasError = false;

          if (attendance && staff) {
            status = new AttendanceState(
              staff,
              attendance,
              holidayCalendars,
              companyHolidayCalendars
            ).get();

            hasError =
              (Array.isArray(attendance.systemComments) &&
                attendance.systemComments.length > 0) ||
              status === AttendanceStatus.Error ||
              status === AttendanceStatus.Late;
          }

          return (
            <CalendarDayCell
              key={`day-${index}`}
              isCurrentMonth={day.isCurrentMonth}
              hasError={hasError}
              status={status}
              isSelected={selectedDate === dateKey}
              onClick={() => day.isCurrentMonth && handleDateClick(day.date)}
            >
              <Stack spacing={0.25} sx={{ height: "100%" }}>
                <DayNumber>{day.date.format("D")}</DayNumber>
                {holidayInfo && <HolidayName>{holidayInfo.name}</HolidayName>}
                {attendance && (
                  <Stack direction="row" spacing={0.25} alignItems="center">
                    <StatusIndicator status={status} />
                    <TimeDisplay>
                      {attendance.startTime && attendance.endTime
                        ? `${dayjs(attendance.startTime).format(
                            "HH:mm"
                          )}-${dayjs(attendance.endTime).format("HH:mm")}`
                        : "-"}
                    </TimeDisplay>
                  </Stack>
                )}
              </Stack>
            </CalendarDayCell>
          );
        })}
      </CalendarGrid>

      {selectedDate && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                {dayjs(selectedDate).format("M月D日(ddd)")} の詳細
              </Typography>
              <Box
                component="span"
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor:
                    selectedDateStatus === AttendanceStatus.Error
                      ? "error.light"
                      : selectedDateStatus === AttendanceStatus.Late
                      ? "warning.light"
                      : selectedDateStatus === AttendanceStatus.Ok
                      ? "success.light"
                      : "grey.200",
                  color:
                    selectedDateStatus === AttendanceStatus.Error
                      ? "error.dark"
                      : selectedDateStatus === AttendanceStatus.Late
                      ? "warning.dark"
                      : selectedDateStatus === AttendanceStatus.Ok
                      ? "success.dark"
                      : "text.secondary",
                }}
              >
                {selectedDateStatus === AttendanceStatus.Error
                  ? "エラー"
                  : selectedDateStatus === AttendanceStatus.Late
                  ? "遅刻"
                  : selectedDateStatus === AttendanceStatus.Ok
                  ? "正常"
                  : "未入力"}
              </Box>
            </Stack>

            <Stack spacing={1}>
              {(() => {
                const holidayInfo = getHolidayInfo(dayjs(selectedDate));
                if (holidayInfo) {
                  return (
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        backgroundColor:
                          holidayInfo.type === "holiday"
                            ? "#ffebee"
                            : "#e3f2fd",
                        border: "1px solid",
                        borderColor:
                          holidayInfo.type === "holiday"
                            ? "#ef5350"
                            : "#42a5f5",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: "bold",
                          color:
                            holidayInfo.type === "holiday"
                              ? "#d32f2f"
                              : "#1976d2",
                        }}
                      >
                        {holidayInfo.type === "holiday"
                          ? "国民の祝日"
                          : "会社休日"}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            holidayInfo.type === "holiday"
                              ? "#d32f2f"
                              : "#1976d2",
                        }}
                      >
                        {holidayInfo.name}
                      </Typography>
                    </Box>
                  );
                }
                return null;
              })()}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  勤務時間
                </Typography>
                <Typography variant="body2">
                  {selectedAttendance?.startTime && selectedAttendance?.endTime
                    ? `${dayjs(selectedAttendance.startTime).format(
                        "HH:mm"
                      )} - ${dayjs(selectedAttendance.endTime).format("HH:mm")}`
                    : "未入力"}
                </Typography>
              </Box>

              {selectedAttendance?.rests &&
                selectedAttendance.rests.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      休憩時間
                    </Typography>
                    {selectedAttendance.rests
                      .filter(
                        (rest): rest is NonNullable<typeof rest> => !!rest
                      )
                      .map((rest, idx) => (
                        <Typography key={idx} variant="body2">
                          {rest.startTime && rest.endTime
                            ? `${dayjs(rest.startTime).format(
                                "HH:mm"
                              )} - ${dayjs(rest.endTime).format("HH:mm")}`
                            : "-"}
                        </Typography>
                      ))}
                  </Box>
                )}

              {(selectedAttendance?.paidHolidayFlag ||
                selectedAttendance?.specialHolidayFlag ||
                selectedAttendance?.absentFlag ||
                selectedAttendance?.substituteHolidayDate) && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    摘要
                  </Typography>
                  <Typography variant="body2">
                    {selectedAttendance?.paidHolidayFlag && "有給休暇"}
                    {selectedAttendance?.specialHolidayFlag && "特別休暇"}
                    {selectedAttendance?.absentFlag && "欠勤"}
                    {selectedAttendance?.substituteHolidayDate &&
                      `振替休日 (${dayjs(
                        selectedAttendance.substituteHolidayDate
                      ).format("M/D")})`}
                  </Typography>
                </Box>
              )}

              {selectedAttendance?.systemComments &&
                selectedAttendance.systemComments.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="error">
                      システムコメント
                    </Typography>
                    {selectedAttendance.systemComments
                      .filter(
                        (comment): comment is NonNullable<typeof comment> =>
                          !!comment
                      )
                      .map((comment, idx) => (
                        <Typography key={idx} variant="body2" color="error">
                          {comment.comment}
                        </Typography>
                      ))}
                  </Box>
                )}
            </Stack>

            <Stack direction="row" spacing={1}>
              <Box
                component="button"
                onClick={() => handleEdit(selectedDate)}
                sx={{
                  flex: 1,
                  py: 1,
                  px: 2,
                  border: "1px solid",
                  borderColor: "primary.main",
                  borderRadius: 1,
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                }}
              >
                編集
              </Box>
              <Box
                component="button"
                onClick={() => setSelectedDate(null)}
                sx={{
                  flex: 1,
                  py: 1,
                  px: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  backgroundColor: "background.paper",
                  color: "text.primary",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                閉じる
              </Box>
            </Stack>
          </Stack>
        </Box>
      )}
    </CalendarContainer>
  );
}
