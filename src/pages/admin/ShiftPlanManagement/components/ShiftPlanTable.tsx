import dayjs from "dayjs";
import PropTypes from "prop-types";
import { memo } from "react";

import { DAY_COLUMNS, EditableField, ShiftPlanRow } from "../shiftPlanUtils";
import DayCapacityCell from "./DayCapacityCell";

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

const thCell = "px-2 py-2 text-xs font-semibold text-left whitespace-nowrap border-b border-[#D9E2DD]";
const thCellCenter = "px-1 py-2 text-xs font-semibold text-center whitespace-nowrap border-b border-[#D9E2DD]";
const tdCell = "px-2 py-1.5 text-sm whitespace-nowrap border-b border-[#EDF1EF]";

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
    <div className="relative overflow-x-auto rounded-2xl border border-[rgba(226,232,240,0.8)] bg-white shadow-[0_24px_48px_-36px_rgba(15,23,42,0.35)]">
      {isBusy && (
        <div className="absolute inset-x-0 top-0 h-[3px] z-10 overflow-hidden rounded-t-2xl bg-[#EDF1EF]">
          <div
            className="h-full animate-pulse"
            style={{ backgroundColor: "#0FA85E" }}
          />
        </div>
      )}
      <table className="w-full border-collapse text-sm">
        <thead className="bg-[#F8FAF9]">
          <tr>
            <th rowSpan={2} className={thCell} style={{ width: 72 }}>月</th>
            <th rowSpan={2} className={thCell} style={{ width: 152 }}>申請開始</th>
            <th rowSpan={2} className={thCell} style={{ width: 152 }}>申請終了</th>
            <th rowSpan={2} className={thCellCenter} style={{ width: 100 }}>手動停止</th>
            <th
              colSpan={DAY_COLUMNS.length}
              className={thCellCenter}
              style={{ borderLeft: "1px solid #D9E2DD" }}
            >
              日別人数
            </th>
          </tr>
          <tr>
            {DAY_COLUMNS.map((day) => (
              <th
                key={`day-header-${day}`}
                className={thCellCenter}
                style={{ minWidth: 52, padding: "4px 2px", borderLeft: day === 1 ? "1px solid #D9E2DD" : undefined }}
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const monthCursor = dayjs().year(selectedYear).month(row.month - 1);
            const rowDaysInMonth = monthCursor.daysInMonth();
            return (
              <tr key={`${selectedYear}-${row.month}`} className="hover:bg-[#F8FAF9] transition-colors">
                <td className={tdCell}>
                  <span className="font-bold" style={{ color: "#1E2A25" }}>
                    {row.month}月
                  </span>
                </td>
                <td className={tdCell}>
                  <input
                    type="date"
                    value={row.editStart}
                    onChange={(e) => onFieldChange(row.month, "editStart", e.target.value)}
                    className="text-sm px-2 py-1 rounded-md border border-[#C3CFC7] focus:outline-none focus:ring-2 focus:ring-[rgba(15,168,94,0.3)] w-full max-w-[160px]"
                    style={{ color: "#2E3D36" }}
                  />
                </td>
                <td className={tdCell}>
                  <input
                    type="date"
                    value={row.editEnd}
                    onChange={(e) => onFieldChange(row.month, "editEnd", e.target.value)}
                    className="text-sm px-2 py-1 rounded-md border border-[#C3CFC7] focus:outline-none focus:ring-2 focus:ring-[rgba(15,168,94,0.3)] w-full max-w-[160px]"
                    style={{ color: "#2E3D36" }}
                  />
                </td>
                <td className={`${tdCell} text-center`}>
                  {row.enabled ? (
                    <button
                      type="button"
                      onClick={() => onToggleEnabled(row.month)}
                      className="text-xs px-3 py-1 rounded-md border font-medium transition-colors"
                      style={{
                        borderColor: "#C3CFC7",
                        color: "#45574F",
                        backgroundColor: "transparent",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#EDF1EF"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                    >
                      申請停止
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onToggleEnabled(row.month)}
                      className="text-xs px-3 py-1 rounded-md font-medium text-white transition-colors"
                      style={{ backgroundColor: "#0FA85E" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0B8A4C"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0FA85E"; }}
                    >
                      申請再開
                    </button>
                  )}
                </td>
                {DAY_COLUMNS.map((day) => {
                  if (day > rowDaysInMonth) {
                    return (
                      <td
                        key={`${row.month}-day-${day}`}
                        style={{
                          padding: "0 2px",
                          minWidth: 52,
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #EDF1EF",
                          borderLeft: day === 1 ? "1px solid #D9E2DD" : undefined,
                        }}
                      />
                    );
                  }
                  const dayIndex = day - 1;
                  const value = row.dailyCapacity[dayIndex] ?? "";
                  return (
                    <DayCapacityCell
                      key={`${row.month}-day-${day}`}
                      selectedYear={selectedYear}
                      month={row.month}
                      day={day}
                      value={value}
                      holidayNameMap={holidayNameMap}
                      onCommit={(nextValue) =>
                        onDailyCapacityChange(row.month, dayIndex, nextValue)
                      }
                      onTabNextDay={() => onTabNextDay(row.month, dayIndex)}
                      onRegisterCellRef={onRegisterCellRef}
                    />
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
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
