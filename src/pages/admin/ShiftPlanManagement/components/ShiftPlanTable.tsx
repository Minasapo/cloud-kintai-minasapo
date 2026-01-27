import {
  Box,
  Button,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import { memo } from "react";

import {
  CELL_NOWRAP_SX,
  DAY_COLUMNS,
  EditableField,
  HOLIDAY_BG,
  SATURDAY_BG,
  ShiftPlanRow,
  SUNDAY_BG,
  WEEKDAY_LABELS,
} from "../shiftPlanUtils";
import EditableCapacityCell from "./EditableCapacityCell";

type ShiftPlanTableProps = {
  selectedYear: number;
  rows: ShiftPlanRow[];
  isBusy: boolean;
  holidayNameMap: Map<string, string>;
  onFieldChange: (month: number, field: EditableField, value: string) => void;
  onToggleEnabled: (month: number) => void;
  onDailyCapacityChange: (month: number, dayIndex: number, value: string) => void;
  onTabNextDay: (month: number, dayIndex: number) => void;
  onRegisterCellRef: (cellId: string, element: HTMLElement | null) => void;
};

const ShiftPlanTableBase: React.FC<ShiftPlanTableProps> = ({
  selectedYear,
  rows,
  isBusy,
  holidayNameMap,
  onFieldChange,
  onToggleEnabled,
  onDailyCapacityChange,
  onTabNextDay,
  onRegisterCellRef,
}: ShiftPlanTableProps) => {
  return (
    <Paper elevation={0} variant="outlined" sx={{ position: "relative" }}>
      {isBusy && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 2,
          }}
        >
          <LinearProgress />
        </Box>
      )}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell rowSpan={2} sx={{ width: 96, ...CELL_NOWRAP_SX }}>
                月
              </TableCell>
              <TableCell rowSpan={2} sx={{ width: 160, ...CELL_NOWRAP_SX }}>
                申請開始
              </TableCell>
              <TableCell rowSpan={2} sx={{ width: 160, ...CELL_NOWRAP_SX }}>
                申請終了
              </TableCell>
              <TableCell
                rowSpan={2}
                align="center"
                sx={{ width: 160, ...CELL_NOWRAP_SX }}
              >
                手動停止
              </TableCell>
              <TableCell
                align="center"
                colSpan={DAY_COLUMNS.length}
                sx={{ px: 0.5, ...CELL_NOWRAP_SX }}
              >
                日別人数
              </TableCell>
            </TableRow>
            <TableRow>
              {DAY_COLUMNS.map((day) => (
                <TableCell
                  key={`day-header-${day}`}
                  align="center"
                  sx={{ minWidth: 52, px: 0.5, ...CELL_NOWRAP_SX }}
                >
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const monthCursor = dayjs().year(selectedYear).month(row.month - 1);
              const rowDaysInMonth = monthCursor.daysInMonth();
              return (
                <TableRow key={`${selectedYear}-${row.month}`} hover>
                  <TableCell sx={{ width: 96, ...CELL_NOWRAP_SX }}>
                    <Typography fontWeight="bold">{row.month}月</Typography>
                  </TableCell>
                  <TableCell sx={{ width: 160, ...CELL_NOWRAP_SX }}>
                    <TextField
                      type="date"
                      size="small"
                      value={row.editStart}
                      fullWidth
                      sx={{ maxWidth: 180 }}
                      onChange={(event) =>
                        onFieldChange(row.month, "editStart", event.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell sx={{ width: 160, ...CELL_NOWRAP_SX }}>
                    <TextField
                      type="date"
                      size="small"
                      value={row.editEnd}
                      fullWidth
                      sx={{ maxWidth: 180 }}
                      onChange={(event) =>
                        onFieldChange(row.month, "editEnd", event.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell align="center" sx={CELL_NOWRAP_SX}>
                    <Button
                      size="small"
                      variant={row.enabled ? "outlined" : "contained"}
                      color="primary"
                      onClick={() => onToggleEnabled(row.month)}
                    >
                      {row.enabled ? "申請停止" : "申請再開"}
                    </Button>
                  </TableCell>
                  {DAY_COLUMNS.map((day) => {
                    if (day > rowDaysInMonth) {
                      return (
                        <TableCell
                          key={`${row.month}-day-${day}`}
                          align="center"
                          sx={{ px: 0.25, minWidth: 52, ...CELL_NOWRAP_SX }}
                        />
                      );
                    }
                    const dayIndex = day - 1;
                    const value = row.dailyCapacity[dayIndex] ?? "";
                    const dayInstance = monthCursor.date(day);
                    const weekdayIndex = dayInstance.day();
                    const dateKey = dayInstance.format("YYYY-MM-DD");
                    const holidayName = holidayNameMap.get(dateKey);
                    const isHoliday = Boolean(holidayName);
                    const weekdayLabel = WEEKDAY_LABELS[weekdayIndex];
                    const isSunday = weekdayIndex === 0;
                    const isSaturday = weekdayIndex === 6;
                    const cellBgColor = isHoliday
                      ? HOLIDAY_BG
                      : isSunday
                        ? SUNDAY_BG
                        : isSaturday
                          ? SATURDAY_BG
                          : undefined;
                    const weekdayColor = isSunday
                      ? "error.main"
                      : isSaturday
                        ? "primary.main"
                        : "text.secondary";
                    const labelColor = isHoliday ? "warning.dark" : weekdayColor;
                    const labelText = isHoliday ? "祝" : weekdayLabel;
                    const cellId = `cell-${selectedYear}-${row.month}-${dayIndex}`;
                    const cellContent = (
                      <EditableCapacityCell
                        value={value}
                        labelText={labelText}
                        labelColor={labelColor}
                        onCommit={(nextValue) =>
                          onDailyCapacityChange(row.month, dayIndex, nextValue)
                        }
                        onTabNextDay={() => onTabNextDay(row.month, dayIndex)}
                      />
                    );
                    return (
                      <TableCell
                        key={`${row.month}-day-${day}`}
                        align="center"
                        sx={{
                          px: 0.25,
                          minWidth: 52,
                          backgroundColor: cellBgColor,
                          ...CELL_NOWRAP_SX,
                        }}
                      >
                        <Box
                          ref={(ref) =>
                            onRegisterCellRef(cellId, ref as HTMLElement | null)
                          }
                        >
                          {isHoliday ? (
                            <Tooltip title={holidayName ?? "祝日"} placement="top">
                              {cellContent}
                            </Tooltip>
                          ) : (
                            cellContent
                          )}
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

ShiftPlanTableBase.propTypes = {
  selectedYear: PropTypes.number.isRequired,
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.number.isRequired,
      editStart: PropTypes.string.isRequired,
      editEnd: PropTypes.string.isRequired,
      enabled: PropTypes.bool.isRequired,
      dailyCapacity: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
  ).isRequired,
  isBusy: PropTypes.bool.isRequired,
  holidayNameMap: PropTypes.instanceOf(Map).isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onToggleEnabled: PropTypes.func.isRequired,
  onDailyCapacityChange: PropTypes.func.isRequired,
  onTabNextDay: PropTypes.func.isRequired,
  onRegisterCellRef: PropTypes.func.isRequired,
};

const ShiftPlanTable = memo(ShiftPlanTableBase);

export default ShiftPlanTable;
