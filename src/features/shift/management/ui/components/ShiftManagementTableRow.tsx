import {
  Box,
  Checkbox,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { Dayjs } from "dayjs";
import React from "react";

import { ShiftState } from "../../lib/generateMockShifts";
import { getCellHighlightSx } from "../../lib/selectionHighlight";
import { defaultStatusVisual, statusVisualMap } from "../../lib/shiftStateMapping";
import {
  DAY_COL_WIDTH,
  SHIFT_BOARD_CELL_BASE_SX,
  SHIFT_BOARD_INTERACTIVE_FOCUS_SX,
  SUMMARY_LEFTS,
} from "../ShiftManagementBoard.styles";

type Props = {
  staff: { id: string; name: string };
  days: Dayjs[];
  staffShifts: Record<string, ShiftState> | undefined;
  isSelected: boolean;
  selectedDayKeys: Set<string>;
  onStaffCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>, staffId: string) => void;
  onOpenShiftEditDialog: (target: { staffId: string; staffName: string; dateKey: string }, currentState: ShiftState) => void;
};

export const ShiftManagementTableRow: React.FC<Props> = ({
  staff,
  days,
  staffShifts,
  isSelected,
  selectedDayKeys,
  onStaffCheckboxChange,
  onOpenShiftEditDialog,
}) => {
  let workCount = 0;
  let holidayCount = 0;
  if (staffShifts) {
    Object.values(staffShifts).forEach((state) => {
      if (state === "work") workCount++;
      if (state === "fixedOff" || state === "requestedOff") holidayCount++;
    });
  }

  return (
    <TableRow hover>
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
            checked={isSelected}
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
        {/* 履歴表示ロジックは必要に応じてProps追加 */}
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
              ...getCellHighlightSx(isSelected, selectedDayKeys.has(dayKey)),
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
};
