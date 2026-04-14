import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { PANEL_HEIGHTS } from "@shared/config/uiDimensions";
import { Dayjs } from "dayjs";
import { MouseEvent, ReactNode } from "react";

import { ShiftRequestSummary } from "../model/shiftRequestSummary";
import { SelectedDateMap, ShiftRequestDayStatus } from "../model/statusMapping";
import {
  STATUS_LABEL_MAP,
  STATUS_MOBILE_LABEL_MAP,
  WEEKDAY_LABELS,
} from "./constants";

type ShiftCalendarPanelProps = {
  isLoading: boolean;
  isMobile: boolean;
  isTablet: boolean;
  interactionDisabled: boolean;
  isSelectionMode: boolean;
  canBulkSelectByWeekday: boolean;
  calendarDays: Dayjs[];
  monthStart: Dayjs;
  focusedDateKey: string | null;
  selectedRowKeys: string[];
  selectedDates: SelectedDateMap;
  statusBackgroundMap: Record<ShiftRequestDayStatus, string>;
  summary: ShiftRequestSummary;
  onToggleSelectionMode: (checked: boolean) => void;
  onToggleAllRowsSelection: () => void;
  onClearRowSelection: () => void;
  onWeekdayLabelClick: (weekdayIndex: number) => void;
  onCalendarDayClick: (
    dayValue: Dayjs,
    event?: MouseEvent<HTMLDivElement>,
  ) => void;
  detailPanel: ReactNode;
};

export function ShiftCalendarPanel({
  isLoading,
  isMobile,
  isTablet,
  interactionDisabled,
  isSelectionMode,
  canBulkSelectByWeekday,
  calendarDays,
  monthStart,
  focusedDateKey,
  selectedRowKeys,
  selectedDates,
  statusBackgroundMap,
  summary,
  onToggleSelectionMode,
  onToggleAllRowsSelection,
  onClearRowSelection,
  onWeekdayLabelClick,
  onCalendarDayClick,
  detailPanel,
}: ShiftCalendarPanelProps) {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: { xs: 1.5, sm: 2.25 },
        borderRadius: "24px",
        border: "1px solid rgba(226,232,240,0.8)",
        boxShadow: "0 24px 48px -36px rgba(15,23,42,0.35)",
        bgcolor: "#ffffff",
      }}
    >
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      <Box sx={{ mb: 2 }}>
        <Stack spacing={2}>
          <Box>
            <Stack spacing={1}>
              <Stack
                direction={isMobile ? "column" : "row"}
                alignItems={isMobile ? "flex-start" : "center"}
                justifyContent="space-between"
                rowGap={1}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isSelectionMode}
                      onChange={(event) => onToggleSelectionMode(event.target.checked)}
                      disabled={interactionDisabled}
                    />
                  }
                  label="選択モード"
                />
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  justifyContent={isMobile ? "flex-start" : "flex-end"}
                >
                  <Button
                    size="small"
                    disabled={interactionDisabled || !isSelectionMode}
                    onClick={onToggleAllRowsSelection}
                  >
                    すべて選択
                  </Button>
                  <Button
                    size="small"
                    disabled={interactionDisabled || !isSelectionMode}
                    onClick={onClearRowSelection}
                  >
                    選択解除
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                md: "minmax(0, 2fr) minmax(0, 1fr)",
              },
              gap: 2,
              alignItems: "start",
            }}
          >
            <Box>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ color: "#475569", fontWeight: 700 }}
              >
                カレンダー
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  gap: { xs: 0.25, sm: 0.5 },
                  textAlign: "center",
                }}
              >
                {WEEKDAY_LABELS.map((label, idx) => (
                  <Typography
                    key={`weekday-${idx}`}
                    variant="caption"
                    role={canBulkSelectByWeekday ? "button" : undefined}
                    tabIndex={canBulkSelectByWeekday ? 0 : undefined}
                    onClick={
                      canBulkSelectByWeekday
                        ? () => onWeekdayLabelClick(idx)
                        : undefined
                    }
                    onKeyDown={
                      canBulkSelectByWeekday
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              onWeekdayLabelClick(idx);
                            }
                          }
                        : undefined
                    }
                    sx={{
                      color: "text.secondary",
                      py: 0.5,
                      cursor: canBulkSelectByWeekday ? "pointer" : "default",
                      userSelect: "none",
                    }}
                  >
                    {label}
                  </Typography>
                ))}
                {calendarDays.map((dayValue) => {
                  const key = dayValue.format("YYYY-MM-DD");
                  const status = selectedDates[key]?.status;
                  const isCurrentMonthDay = dayValue.isSame(monthStart, "month");
                  const isFocused = focusedDateKey === key;
                  const isSelectedDate = selectedRowKeys.includes(key);
                  const statusBgColor =
                    (status && statusBackgroundMap[status]) ||
                    theme.palette.background.paper;
                  const boxShadowValue = isFocused
                    ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.8)}`
                    : isSelectedDate
                      ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.5)}`
                      : undefined;
                  const borderColor = isFocused
                    ? theme.palette.primary.main
                    : isSelectedDate
                      ? alpha(theme.palette.primary.main, 0.5)
                      : "divider";

                  return (
                    <Box
                      key={`calendar-${key}`}
                      onClick={(event) => onCalendarDayClick(dayValue, event)}
                      sx={{
                        position: "relative",
                        minHeight: {
                          xs: 42,
                          sm: PANEL_HEIGHTS.FORM_ITEM_MIN,
                        },
                        px: { xs: 0.25, sm: 0.5 },
                        py: { xs: 0.25, sm: 0.5 },
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor,
                        bgcolor: statusBgColor,
                        boxShadow: boxShadowValue,
                        color: isCurrentMonthDay
                          ? "text.primary"
                          : "text.disabled",
                        cursor: isCurrentMonthDay ? "pointer" : "default",
                        opacity: isCurrentMonthDay ? 1 : 0.4,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.25,
                      }}
                    >
                      <Typography variant={isTablet ? "body2" : "subtitle2"}>
                        {dayValue.date()}
                      </Typography>
                      {status && (
                        <Typography variant="caption" sx={{ fontSize: 10 }}>
                          {isMobile
                            ? (STATUS_MOBILE_LABEL_MAP[status] ??
                              STATUS_LABEL_MAP[status])
                            : STATUS_LABEL_MAP[status]}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">
                  出勤: {summary.workDays}日 / 固定休: {summary.fixedOffDays}日 /
                  希望休: {summary.requestedOffDays}日
                </Typography>
              </Box>
            </Box>
            <Box>{detailPanel}</Box>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}
