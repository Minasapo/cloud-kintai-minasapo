import dayjs from "dayjs";
import { ReactNode } from "react";

import { getCellHighlightSx } from "../../lib/selectionHighlight";
import {
  SHIFT_BOARD_CELL_BASE_SX,
} from "../ShiftManagementBoard.styles";

export type ShiftManagementSummaryRowProps = {
  label: ReactNode;
  days: dayjs.Dayjs[];
  selectedDayKeys: Set<string>;
  dayColumnWidth: number;
  renderValue: (dayKey: string) => ReactNode;
  className?: string;
  labelCellClassName?: string;
  labelCellSx?: React.CSSProperties;
};

export default function ShiftManagementSummaryRow({
  label,
  days,
  selectedDayKeys,
  dayColumnWidth,
  renderValue,
  className = "",
  labelCellClassName = "",
  labelCellSx = {},
}: ShiftManagementSummaryRowProps) {
  return (
    <tr className={`cursor-default ${className}`}>
      <td
        colSpan={3}
        className={`sticky left-0 z-[2] bg-white px-3 border-r border-gray-200 whitespace-nowrap overflow-hidden text-ellipsis text-right ${labelCellClassName}`}
        style={{
          ...SHIFT_BOARD_CELL_BASE_SX,
          height: "44px",
          ...labelCellSx,
        }}
      >
        <span className="text-sm text-gray-700">{label}</span>
      </td>

      {days.map((d) => {
        const key = d.format("YYYY-MM-DD");
        const highlightSx = getCellHighlightSx(false, selectedDayKeys.has(key));
        return (
          <td
            key={key}
            className="relative border-l border-gray-100 text-center align-middle"
            style={{
              ...SHIFT_BOARD_CELL_BASE_SX,
              width: `${dayColumnWidth}px`,
              minWidth: `${dayColumnWidth}px`,
              height: "44px",
              ...(highlightSx as React.CSSProperties),
            }}
          >
            {renderValue(key)}
          </td>
        );
      })}
    </tr>
  );
}
