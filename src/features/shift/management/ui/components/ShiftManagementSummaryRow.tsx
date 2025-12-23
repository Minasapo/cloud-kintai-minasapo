import { TableCell, TableCellProps, TableRow, Typography } from "@mui/material";
import dayjs from "dayjs";
import { ReactNode } from "react";

import { DESIGN_TOKENS, designTokenVar } from "@/shared/designSystem";

import { getCellHighlightSx } from "../../lib/selectionHighlight";

const shiftBoardTokens = DESIGN_TOKENS.component.shiftBoard;
const SHIFT_BOARD_BASE_PATH = "component.shiftBoard";
const SHIFT_BOARD_PADDING_X = designTokenVar(
  `${SHIFT_BOARD_BASE_PATH}.columnGap`,
  `${shiftBoardTokens.columnGap}px`
);
const SHIFT_BOARD_PADDING_Y = designTokenVar(
  `${SHIFT_BOARD_BASE_PATH}.rowGap`,
  `${shiftBoardTokens.rowGap}px`
);
const SHIFT_BOARD_HALF_PADDING_Y = `calc(${SHIFT_BOARD_PADDING_Y} / 2)`;
const SHIFT_BOARD_CELL_RADIUS = designTokenVar(
  `${SHIFT_BOARD_BASE_PATH}.cellRadius`,
  `${shiftBoardTokens.cellRadius}px`
);
const SHIFT_BOARD_TRANSITION = `${designTokenVar(
  "motion.duration.medium",
  `${DESIGN_TOKENS.motion.duration.medium}ms`
)} ${designTokenVar(
  "motion.easing.standard",
  DESIGN_TOKENS.motion.easing.standard
)}`;
const SHIFT_BOARD_CELL_BASE_SX = {
  borderRadius: SHIFT_BOARD_CELL_RADIUS,
  transition: `background-color ${SHIFT_BOARD_TRANSITION}, box-shadow ${SHIFT_BOARD_TRANSITION}`,
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
