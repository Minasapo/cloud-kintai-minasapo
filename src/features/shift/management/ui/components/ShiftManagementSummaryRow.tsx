import { TableCell, TableCellProps, TableRow, Typography } from "@mui/material";
import dayjs from "dayjs";
import { ReactNode } from "react";

import { DESIGN_TOKENS } from "@/shared/designSystem";

import { getCellHighlightSx } from "../../lib/selectionHighlight";

const shiftBoardTokens = DESIGN_TOKENS.component.shiftBoard;
const toSpacingUnit = (value: number) => value / 8;
const SHIFT_BOARD_PADDING_X = toSpacingUnit(shiftBoardTokens.columnGap);
const SHIFT_BOARD_HALF_PADDING_Y = toSpacingUnit(shiftBoardTokens.rowGap) / 2;
const SHIFT_BOARD_CELL_BASE_SX = {
  borderRadius: `${shiftBoardTokens.cellRadius}px`,
  transition: `background-color ${DESIGN_TOKENS.motion.duration.medium}ms ${DESIGN_TOKENS.motion.easing.standard}, box-shadow ${DESIGN_TOKENS.motion.duration.medium}ms ${DESIGN_TOKENS.motion.easing.standard}`,
};

export type ShiftManagementSummaryRowProps = {
  label: ReactNode;
  days: dayjs.Dayjs[];
  selectedDayKeys: Set<string>;
  dayColumnWidth: number;
  renderValue: (dayKey: string) => ReactNode;
  labelCellProps?: TableCellProps;
};

export default function ShiftManagementSummaryRow({
  label,
  days,
  selectedDayKeys,
  dayColumnWidth,
  renderValue,
  labelCellProps,
}: ShiftManagementSummaryRowProps) {
  const { sx, colSpan, ...restLabelProps } = labelCellProps ?? {};

  return (
    <TableRow sx={{ cursor: "default" }}>
      <TableCell
        colSpan={colSpan ?? 3}
        sx={{
          ...SHIFT_BOARD_CELL_BASE_SX,
          bgcolor: "background.paper",
          px: SHIFT_BOARD_PADDING_X,
          py: SHIFT_BOARD_HALF_PADDING_Y,
          boxSizing: "border-box",
          borderRight: "1px solid",
          borderColor: "divider",
          position: "sticky",
          left: 0,
          zIndex: 2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "right",
          ...sx,
        }}
        {...restLabelProps}
      >
        <Typography variant="body2">{label}</Typography>
      </TableCell>

      {days.map((d) => {
        const key = d.format("YYYY-MM-DD");
        const highlightSx =
          getCellHighlightSx(false, selectedDayKeys.has(key)) ?? {};
        return (
          <TableCell
            key={key}
            sx={{
              ...SHIFT_BOARD_CELL_BASE_SX,
              px: SHIFT_BOARD_PADDING_X,
              py: SHIFT_BOARD_HALF_PADDING_Y,
              width: dayColumnWidth,
              height: 40,
              position: "relative",
              borderLeft: "1px solid",
              borderColor: "divider",
              ...highlightSx,
            }}
            align="center"
          >
            {renderValue(key)}
          </TableCell>
        );
      })}
    </TableRow>
  );
}
