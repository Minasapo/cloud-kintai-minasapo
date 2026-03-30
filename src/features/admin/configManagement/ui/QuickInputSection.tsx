import { Dayjs } from "dayjs";

import SettingsIcon from "@/features/admin/layout/ui/SettingsIcon";
import {
  SettingsCheckbox,
  SettingsTimeField,
} from "@/features/admin/layout/ui/SettingsPrimitives";

interface QuickInputEntry {
  time: Dayjs;
  enabled: boolean;
}

interface QuickInputSectionProps {
  quickInputStartTimes: QuickInputEntry[];
  quickInputEndTimes: QuickInputEntry[];
  onAddQuickInputStartTime: () => void;
  onQuickInputStartTimeChange: (index: number, newValue: Dayjs | null) => void;
  onQuickInputStartTimeToggle: (index: number) => void;
  onRemoveQuickInputStartTime: (index: number) => void;
  onAddQuickInputEndTime: () => void;
  onQuickInputEndTimeChange: (index: number, newValue: Dayjs | null) => void;
  onQuickInputEndTimeToggle: (index: number) => void;
  onRemoveQuickInputEndTime: (index: number) => void;
}

const QuickInputSection = ({
  quickInputStartTimes,
  quickInputEndTimes,
  onAddQuickInputStartTime,
  onQuickInputStartTimeChange,
  onQuickInputStartTimeToggle,
  onRemoveQuickInputStartTime,
  onAddQuickInputEndTime,
  onQuickInputEndTimeChange,
  onQuickInputEndTimeToggle,
  onRemoveQuickInputEndTime,
}: QuickInputSectionProps) => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-row flex-wrap gap-8 items-start">
      {/* 出勤時間 */}
      <div className="flex flex-col gap-4 flex-1 min-w-[320px] max-w-[420px]">
        <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-2">出勤時間</h3>
        <div className="flex flex-col gap-4">
          {quickInputStartTimes.map((entry, index) => (
            <div
              className="flex flex-row flex-wrap items-center gap-4"
              key={index}
            >
              <SettingsTimeField
                label={`出勤時間 ${index + 1}`}
                value={entry.time}
                onChange={(newValue) =>
                  onQuickInputStartTimeChange(index, newValue)
                }
                className="w-[160px]"
              />
              <div className="min-w-[88px]">
                <SettingsCheckbox
                  checked={entry.enabled}
                  onChange={() => onQuickInputStartTimeToggle(index)}
                  label="有効"
                />
              </div>
              <button
                className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                type="button"
                onClick={() => onRemoveQuickInputStartTime(index)}
                aria-label="削除"
              >
                <SettingsIcon name="delete" />
              </button>
            </div>
          ))}
          <button
            className="text-blue-600 hover:text-blue-800 text-sm font-medium self-start transition"
            type="button"
            onClick={onAddQuickInputStartTime}
          >
            + 出勤時間を追加
          </button>
        </div>
      </div>

      {/* 退勤時間 */}
      <div className="flex flex-col gap-4 flex-1 min-w-[320px] max-w-[420px]">
        <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-2">退勤時間</h3>
        <div className="flex flex-col gap-4">
          {quickInputEndTimes.map((entry, index) => (
            <div
              className="flex flex-row flex-wrap items-center gap-4"
              key={index}
            >
              <SettingsTimeField
                label={`退勤時間 ${index + 1}`}
                value={entry.time}
                onChange={(newValue) =>
                  onQuickInputEndTimeChange(index, newValue)
                }
                className="w-[160px]"
              />
              <div className="min-w-[88px]">
                <SettingsCheckbox
                  checked={entry.enabled}
                  onChange={() => onQuickInputEndTimeToggle(index)}
                  label="有効"
                />
              </div>
              <button
                className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                type="button"
                onClick={() => onRemoveQuickInputEndTime(index)}
                aria-label="削除"
              >
                <SettingsIcon name="delete" />
              </button>
            </div>
          ))}
          <button
            className="text-blue-600 hover:text-blue-800 text-sm font-medium self-start transition"
            type="button"
            onClick={onAddQuickInputEndTime}
          >
            + 退勤時間を追加
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default QuickInputSection;
