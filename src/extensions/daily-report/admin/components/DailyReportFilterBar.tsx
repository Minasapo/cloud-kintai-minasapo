import {
  DISPLAY_STATUSES,
  type DisplayStatus,
  STATUS_META,
} from "../data";
import { INPUT_DATE_CLASS, SELECT_CLASS } from "./styles";

type DailyReportFilterBarProps = {
  statusFilter: DisplayStatus | "";
  staffFilter: string;
  startDate: string;
  endDate: string;
  staffOptions: string[];
  onStatusChange: (value: DisplayStatus | "") => void;
  onStaffChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
};

export function DailyReportFilterBar({
  statusFilter,
  staffFilter,
  startDate,
  endDate,
  staffOptions,
  onStatusChange,
  onStaffChange,
  onStartDateChange,
  onEndDateChange,
}: DailyReportFilterBarProps) {
  return (
    <section className="rounded-2xl border border-emerald-100 bg-white/95 px-4 py-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">ステータス</label>
          <select
            value={statusFilter}
            onChange={(e) =>
              onStatusChange(e.target.value as DisplayStatus | "")
            }
            className={SELECT_CLASS}
          >
            <option value="">すべて</option>
            {DISPLAY_STATUSES.map((key) => (
              <option key={key} value={key}>
                {STATUS_META[key].label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">スタッフ</label>
          <select
            value={staffFilter}
            onChange={(e) => onStaffChange(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">すべて</option>
            {staffOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">開始日</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className={INPUT_DATE_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">終了日</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className={INPUT_DATE_CLASS}
          />
        </div>
      </div>
    </section>
  );
}
