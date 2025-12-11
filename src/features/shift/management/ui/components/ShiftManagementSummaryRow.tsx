import { TableCell, TableCellProps, TableRow, Typography } from "@mui/material";
import dayjs from "dayjs";
import { ReactNode } from "react";

import { getCellHighlightSx } from "../../lib/selectionHighlight";

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
          bgcolor: "background.paper",
          py: 0.25,
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
              p: 0.25,
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
