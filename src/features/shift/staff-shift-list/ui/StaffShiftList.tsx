import { AuthContext } from "@app/providers/auth/AuthContext";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import {
  Box,
  Chip,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import CommonBreadcrumbs from "@shared/ui/breadcrumbs/CommonBreadcrumbs";
import { EmptyState, ProgressBar } from "@shared/ui/feedback";
import dayjs from "dayjs";
import { useContext } from "react";
import { useParams } from "react-router-dom";

import { useStaffShiftListData } from "../model/useStaffShiftListData";

type StaffShiftTableRowProps = {
  dayKey: string;
  dateLabel: string;
  weekdayLabel: string;
  state: "work" | "off" | undefined;
  isPublicHoliday: boolean;
  isCompanyHoliday: boolean;
  isSunday: boolean;
  isSaturday: boolean;
  workType: string | null | undefined;
  disabled?: boolean;
  onShiftChange: (key: string, value: string | null) => void;
};

function StaffShiftTableRow({
  dayKey,
  dateLabel,
  weekdayLabel,
  state,
  isPublicHoliday,
  isCompanyHoliday,
  isSunday,
  isSaturday,
  workType,
  disabled,
  onShiftChange,
}: StaffShiftTableRowProps) {
  const todayKey = dayjs().format("YYYY-MM-DD");
  let rowBg = "transparent";
  let rowFontWeight: number | undefined = undefined;

  if (workType === "shift") {
    rowBg = "transparent";
  } else if (dayKey === todayKey) {
    rowBg = "rgb(255 255 147)";
    rowFontWeight = 700;
  } else if (isPublicHoliday || isCompanyHoliday) {
    rowBg = "rgb(255 147 147)";
  } else if (isSunday) {
    rowBg = "rgb(255 147 147)";
  } else if (isSaturday) {
    rowBg = "rgb(147 255 255)";
  }

  return (
    <TableRow
      sx={{
        alignItems: "center",
        bgcolor: rowBg,
        fontWeight: rowFontWeight,
      }}
    >
      <TableCell
        sx={{
          pr: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 1,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Tooltip title={dayKey}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              <CalendarTodayIcon sx={{ mr: 1 }} fontSize="small" />
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography sx={{ fontWeight: 600 }}>{dateLabel}</Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  {weekdayLabel}
                </Typography>
              </Box>
            </Box>
          </Tooltip>

          {(isPublicHoliday || isCompanyHoliday) && (
            <Chip
              label={isPublicHoliday ? "祝日" : "会社休日"}
              color="error"
              size="small"
            />
          )}
        </Stack>
      </TableCell>

      <TableCell
        align="right"
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 1,
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          alignItems="center"
        >
          <ToggleButtonGroup
            value={state ?? ""}
            exclusive
            size="small"
            disabled={disabled}
            onChange={(_, val) => onShiftChange(dayKey, val)}
          >
            <ToggleButton value="">未登録</ToggleButton>
            <ToggleButton value="work">出勤</ToggleButton>
            <ToggleButton value="off">休み</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </TableCell>
    </TableRow>
  );
}

export default function StaffShiftList() {
  const { staffId } = useParams();
  const { authStatus, cognitoUser } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const currentUserId = cognitoUser?.id ?? "unknown";

  const {
    staff,
    monthStart,
    days,
    shiftStates,
    publicHolidaySet,
    companyHolidaySet,
    isSaving,
    calendarLoading,
    shiftRequestLoading,
    shiftRequestFetching,
    shiftRequest,
    prevMonth,
    nextMonth,
    handleShiftChange,
  } = useStaffShiftListData({
    staffId,
    isAuthenticated,
    currentUserId,
  });

  if (calendarLoading || (shiftRequestLoading && !shiftRequest)) {
    return <ProgressBar className="w-full" />;
  }

  return (
    <Container sx={{ py: 3 }}>
      <Box sx={{ mb: 2 }}>
        <CommonBreadcrumbs
          items={[
            { label: "TOP", href: "/" },
            { label: "シフト管理", href: "/admin/shift" },
          ]}
          current="シフト詳細"
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h5">
          {staff
            ? `${staff.familyName} ${staff.givenName} のシフト`
            : "スタッフが見つかりません"}
        </Typography>
        <Box>
          <Chip
            label="前月"
            onClick={prevMonth}
            sx={{ mr: 1 }}
            clickable
            disabled={isSaving}
          />
          <Chip label={monthStart.format("YYYY年 M月")} sx={{ mr: 1 }} />
          <Chip
            label="翌月"
            onClick={nextMonth}
            clickable
            disabled={isSaving}
          />
        </Box>
      </Box>

      {staff && !shiftRequest && (
        <Box sx={{ mb: 2 }}>
          <EmptyState message="この月のシフトは未登録です" />
        </Box>
      )}

      {staff && (
        <Paper
          elevation={2}
          sx={{
            overflow: "auto",
            borderRadius: 2,
            p: 1,
            bgcolor: "background.paper",
          }}
        >
          <Table size="small" sx={{ minWidth: 320 }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    width: 260,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    py: 1,
                  }}
                >
                  日付
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    py: 1,
                  }}
                  align="right"
                >
                  状態
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {days.map((d) => {
                const key = d.format("YYYY-MM-DD");
                const dateLabel = d.format("M月D日");
                const weekdayLabel = d.format("dddd");
                const state = shiftStates[key];

                return (
                  <StaffShiftTableRow
                    key={key}
                    dayKey={key}
                    dateLabel={dateLabel}
                    weekdayLabel={weekdayLabel}
                    state={state}
                    isPublicHoliday={publicHolidaySet.has(key)}
                    isCompanyHoliday={companyHolidaySet.has(key)}
                    isSunday={d.day() === 0}
                    isSaturday={d.day() === 6}
                    workType={staff?.workType}
                    disabled={isSaving || shiftRequestFetching}
                    onShiftChange={handleShiftChange}
                  />
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
}
