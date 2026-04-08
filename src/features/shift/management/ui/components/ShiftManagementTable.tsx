import {
  Box,
  Checkbox,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Dayjs } from "dayjs";
import React from "react";

import { ShiftState } from "../../lib/generateMockShifts";
import { getCellHighlightSx } from "../../lib/selectionHighlight";
import { defaultStatusVisual, statusVisualMap } from "../../lib/shiftStateMapping";
import {
  AGG_COL_WIDTH,
  COMPANY_HOLIDAY_BG,
  DAY_COL_WIDTH,
  HISTORY_COL_WIDTH,
  HOLIDAY_BG,
  SATURDAY_BG,
  SHIFT_BOARD_CELL_BASE_SX,
  SHIFT_BOARD_INTERACTIVE_FOCUS_SX,
  STAFF_COL_WIDTH,
  SUMMARY_LEFTS,
} from "../ShiftManagementBoard.styles";
import ShiftManagementSummaryRow from "./ShiftManagementSummaryRow";

type Props = {
  days: Dayjs[];
  groupedShiftStaffs: any;
  holidaySet: Set<string>;
  companyHolidaySet: Set<string>;
  holidayNameMap: Map<string, string>;
  companyHolidayNameMap: Map<string, string>;
  selectedStaffIds: Set<string>;
  selectedDayKeys: Set<string>;
  onStaffCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>, staffId: string) => void;
  onDayCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>, dayKey: string) => void;
  displayShifts: Map<string, Record<string, ShiftState>>;
  dailyCounts: Map<string, number>;
  plannedDailyCounts: Map<string, number | null>;
  onOpenShiftEditDialog: (target: { staffId: string; staffName: string; dateKey: string }, currentState: ShiftState) => void;
};

export const ShiftManagementTable: React.FC<Props> = ({
  days,
  groupedShiftStaffs,
  holidaySet,
  companyHolidaySet,
  holidayNameMap,
  companyHolidayNameMap,
  selectedStaffIds,
  selectedDayKeys,
  onStaffCheckboxChange,
  onDayCheckboxChange,
  displayShifts,
  dailyCounts,
  plannedDailyCounts,
  onOpenShiftEditDialog,
}) => {
  const getHeaderCellSx = (d: Dayjs) => {
    const dateKey = d.format("YYYY-MM-DD");
    const day = d.day();
    if (holidaySet.has(dateKey) || day === 0)
      return { minWidth: DAY_COL_WIDTH, bgcolor: HOLIDAY_BG };
    if (companyHolidaySet.has(dateKey))
      return { minWidth: DAY_COL_WIDTH, bgcolor: COMPANY_HOLIDAY_BG };
    if (day === 6) return { minWidth: DAY_COL_WIDTH, bgcolor: SATURDAY_BG };
    return { minWidth: DAY_COL_WIDTH };
  };

  return (
    <TableContainer
      sx={{
        maxHeight: "calc(100vh - 280px)",
        overflow: "auto",
        borderRadius: "12px",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        bgcolor: "background.paper",
      }}
    >
      <Table stickyHeader size="small" sx={{ borderCollapse: "separate" }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                left: 0,
                zIndex: 10,
                width: STAFF_COL_WIDTH,
                minWidth: STAFF_COL_WIDTH,
                bgcolor: "background.paper",
                borderRight: "2px solid rgba(0,0,0,0.06)",
                fontWeight: 700,
              }}
            >
              スタッフ名
            </TableCell>
            <TableCell
              sx={{
                left: SUMMARY_LEFTS.aggregate,
                zIndex: 10,
                width: AGG_COL_WIDTH,
                minWidth: AGG_COL_WIDTH,
                bgcolor: "background.paper",
                borderRight: "1px solid rgba(0,0,0,0.06)",
                fontWeight: 700,
              }}
            >
              集計(出勤/休暇)
            </TableCell>
            <TableCell
              sx={{
                left: SUMMARY_LEFTS.changeHistory,
                zIndex: 10,
                width: HISTORY_COL_WIDTH,
                minWidth: HISTORY_COL_WIDTH,
                bgcolor: "background.paper",
                borderRight: "2px solid rgba(0,0,0,0.06)",
                fontWeight: 700,
              }}
            >
              変更履歴
            </TableCell>
            {days.map((d) => {
              const dateKey = d.format("YYYY-MM-DD");
              const holidayName = holidayNameMap.get(dateKey);
              const companyHolidayName = companyHolidayNameMap.get(dateKey);
              return (
                <TableCell
                  key={dateKey}
                  align="center"
                  sx={{
                    ...getHeaderCellSx(d),
                    p: 0.5,
                    borderRight: "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  <Stack spacing={0.2} alignItems="center">
                    <Checkbox
                      size="small"
                      checked={selectedDayKeys.has(dateKey)}
                      onChange={(e) => onDayCheckboxChange(e, dateKey)}
                      sx={{ p: 0.2 }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: holidayName ? "error.main" : "text.secondary",
                      }}
                    >
                      {d.format("D")}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.65rem",
                        color: holidayName ? "error.main" : "text.secondary",
                      }}
                    >
                      {["日", "月", "火", "水", "木", "金", "土"][d.day()]}
                    </Typography>
                    {(holidayName || companyHolidayName) && (
                      <Tooltip title={holidayName || companyHolidayName || ""}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: holidayName ? "error.main" : "info.main",
                          }}
                        />
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          <ShiftManagementSummaryRow
            label="合計出勤人数"
            days={days}
            selectedDayKeys={selectedDayKeys}
            dayColumnWidth={DAY_COL_WIDTH}
            renderValue={(dayKey) => (
              <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {dailyCounts.get(dayKey) || 0}
                </Typography>
                {plannedDailyCounts.get(dayKey) !== null && (
                  <Typography variant="caption" color="text.secondary">
                    / {plannedDailyCounts.get(dayKey)}
                  </Typography>
                )}
              </Stack>
            )}
            labelCellProps={{
              sx: {
                borderRight: "2px solid rgba(0,0,0,0.06)",
                fontWeight: 700,
              },
            }}
          />
          {groupedShiftStaffs.map((group: any) => (
            <React.Fragment key={group.groupId || "no-group"}>
              {group.groupName && (
                <TableRow>
                  <TableCell
                    colSpan={3 + days.length}
                    sx={{
                      bgcolor: "rgba(0,0,0,0.02)",
                      fontWeight: 700,
                      py: 0.5,
                      fontSize: "0.75rem",
                      position: "sticky",
                      left: 0,
                      zIndex: 1,
                    }}
                  >
                    {group.groupName}
                  </TableCell>
                </TableRow>
              )}
              {group.staffs.map((staff: any) => {
                const staffShifts = displayShifts.get(staff.id);
                let workCount = 0;
                let holidayCount = 0;
                if (staffShifts) {
                  Object.values(staffShifts).forEach((state) => {
                    if (state === "work") workCount++;
                    if (state === "fixedOff" || state === "requestedOff") holidayCount++;
                  });
                }

                return (
                  <TableRow key={staff.id} hover>
                    <TableCell
                      sx={{
                        left: 0,
                        zIndex: 5,
                        bgcolor: "background.paper",
                        borderRight: "2px solid rgba(0,0,0,0.06)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Checkbox
                          size="small"
                          checked={selectedStaffIds.has(staff.id)}
                          onChange={(e) => onStaffCheckboxChange(e, staff.id)}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {staff.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell
                      sx={{
                        left: SUMMARY_LEFTS.aggregate,
                        zIndex: 5,
                        bgcolor: "background.paper",
                        borderRight: "1px solid rgba(0,0,0,0.06)",
                      }}
                    >
                      <Stack direction="row" spacing={1}>
                        <Typography variant="caption" color="primary">
                          出:{workCount}
                        </Typography>
                        <Typography variant="caption" color="error">
                          休:{holidayCount}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell
                      sx={{
                        left: SUMMARY_LEFTS.changeHistory,
                        zIndex: 5,
                        bgcolor: "background.paper",
                        borderRight: "2px solid rgba(0,0,0,0.06)",
                      }}
                    >
                      {/* 履歴表示ロジック */}
                    </TableCell>
                    {days.map((d) => {
                      const dayKey = d.format("YYYY-MM-DD");
                      const state: ShiftState = (staffShifts?.[dayKey] as ShiftState) || "none";
                      const visual = statusVisualMap[state] || defaultStatusVisual;

                      return (
                        <TableCell
                          key={dayKey}
                          onClick={() => onOpenShiftEditDialog({ staffId: staff.id, staffName: staff.name, dateKey: dayKey }, state)}
                          sx={{
                            ...SHIFT_BOARD_CELL_BASE_SX,
                            ...SHIFT_BOARD_INTERACTIVE_FOCUS_SX,
                            ...getCellHighlightSx(
                              selectedStaffIds.has(staff.id),
                              selectedDayKeys.has(dayKey),
                            ),
                            cursor: "pointer",
                            p: 0,
                            minWidth: DAY_COL_WIDTH,
                            height: 44,
                            position: "relative",
                            borderRight: "1px solid rgba(0,0,0,0.04)",
                            borderBottom: "1px solid rgba(0,0,0,0.04)",
                          }}
                        >
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: visual.color,
                              fontSize: "0.75rem",
                              fontWeight: 700,
                            }}
                          >
                            {visual.label}
                          </Box>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
