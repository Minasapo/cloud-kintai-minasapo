import dayjs from "dayjs";
import PropTypes from "prop-types";
import React, { memo } from "react";

import {
  HOLIDAY_BG,
  HOLIDAY_TEXT,
  NORMAL_TEXT,
  SATURDAY_BG,
  SATURDAY_TEXT,
  SUNDAY_BG,
  SUNDAY_TEXT,
  WEEKDAY_LABELS,
} from "../shiftPlanUtils";
import EditableCapacityCell from "./EditableCapacityCell";

type DayCapacityCellProps = {
  selectedYear: number;
  month: number;
  day: number;
  value: string;
  holidayNameMap: Map<string, string>;
  onCommit: (nextValue: string) => void;
  onTabNextDay: () => void;
  onRegisterCellRef: (cellId: string, element: HTMLElement | null) => void;
};

const DayCapacityCellBase: React.FC<DayCapacityCellProps> = ({
  selectedYear,
  month,
  day,
  value,
  holidayNameMap,
  onCommit,
  onTabNextDay,
  onRegisterCellRef,
}: DayCapacityCellProps) => {
  const dayIndex = day - 1;
  const dayInstance = dayjs().year(selectedYear).month(month - 1).date(day);
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
  const weekdayColor = isSunday ? SUNDAY_TEXT : isSaturday ? SATURDAY_TEXT : NORMAL_TEXT;
  const labelColor = isHoliday ? HOLIDAY_TEXT : weekdayColor;
  const labelText = isHoliday ? "祝" : weekdayLabel;
  const cellId = `cell-${selectedYear}-${month}-${dayIndex}`;

  return (
    <td
      align="center"
      title={isHoliday ? (holidayName ?? "祝日") : undefined}
      style={{
        padding: "0 2px",
        minWidth: 52,
        whiteSpace: "nowrap",
        backgroundColor: cellBgColor,
      }}
    >
      <div ref={(ref) => onRegisterCellRef(cellId, ref as HTMLElement | null)}>
        <EditableCapacityCell
          value={value}
          labelText={labelText}
          labelColor={labelColor}
          onCommit={onCommit}
          onTabNextDay={onTabNextDay}
        />
      </div>
    </td>
  );
};

DayCapacityCellBase.propTypes = {
  selectedYear: PropTypes.number.isRequired,
  month: PropTypes.number.isRequired,
  day: PropTypes.number.isRequired,
  value: PropTypes.string.isRequired,
  holidayNameMap: PropTypes.instanceOf(Map).isRequired,
  onCommit: PropTypes.func.isRequired,
  onTabNextDay: PropTypes.func.isRequired,
  onRegisterCellRef: PropTypes.func.isRequired,
};

const DayCapacityCell = memo(DayCapacityCellBase);

export default DayCapacityCell;
