import { Dayjs } from "dayjs";
import React from "react";

import { ShiftState } from "../../lib/generateMockShifts";
import { getCellHighlightSx } from "../../lib/selectionHighlight";
import {
  defaultStatusVisual,
  statusVisualMap,
} from "../../lib/shiftStateMapping";
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
  onStaffCheckboxChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    staffId: string,
  ) => void;
  onOpenShiftEditDialog: (
    target: { staffId: string; staffName: string; dateKey: string },
    currentState: ShiftState,
  ) => void;
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
    <tr className="hover:bg-gray-50 group">
      <td
        className="sticky left-0 z-[5] bg-white px-3 border-r-2 border-gray-100 whitespace-nowrap overflow-hidden text-ellipsis"
        style={{ height: "44px" }}
      >
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            checked={isSelected}
            onChange={(e) => onStaffCheckboxChange(e, staff.id)}
          />
          <span className="text-sm font-medium text-gray-700">{staff.name}</span>
        </div>
      </td>
      <td
        className="sticky z-[5] bg-white px-2 border-r border-gray-100"
        style={{ left: `${SUMMARY_LEFTS.aggregate}px`, height: "44px" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-blue-600">出:{workCount}</span>
          <span className="text-xs font-bold text-red-500">休:{holidayCount}</span>
        </div>
      </td>
      <td
        className="sticky z-[5] bg-white px-2 border-r-2 border-gray-100"
        style={{ left: `${SUMMARY_LEFTS.changeHistory}px`, height: "44px" }}
      >
        {/* 履歴表示ロジック */}
      </td>
      {days.map((d) => {
        const dayKey = d.format("YYYY-MM-DD");
        const state: ShiftState =
          (staffShifts?.[dayKey] as ShiftState) || "none";
        const visual = statusVisualMap[state] || defaultStatusVisual;
        const highlightSx = getCellHighlightSx(
          isSelected,
          selectedDayKeys.has(dayKey),
        );

        return (
          <td
            key={dayKey}
            onClick={() =>
              onOpenShiftEditDialog(
                {
                  staffId: staff.id,
                  staffName: staff.name,
                  dateKey: dayKey,
                },
                state,
              )
            }
            className="cursor-pointer p-0 align-middle border-r border-b border-gray-100"
            style={{
              ...SHIFT_BOARD_CELL_BASE_SX,
              ...(SHIFT_BOARD_INTERACTIVE_FOCUS_SX as React.CSSProperties),
              ...(highlightSx as React.CSSProperties),
              width: `${DAY_COL_WIDTH}px`,
              minWidth: `${DAY_COL_WIDTH}px`,
              height: "44px",
            }}
          >
            <div
              className="w-full h-full flex items-center justify-center text-xs font-bold"
              style={{ color: visual.color }}
            >
              {visual.label}
            </div>
          </td>
        );
      })}
    </tr>
  );
};
