import { Dayjs } from "dayjs";

import { SettingsTimeField } from "@/features/admin/layout/ui/SettingsPrimitives";

interface WorkingTimeSectionProps {
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  lunchRestStartTime: Dayjs | null;
  lunchRestEndTime: Dayjs | null;
  setStartTime: (value: Dayjs | null) => void;
  setEndTime: (value: Dayjs | null) => void;
  setLunchRestStartTime: (value: Dayjs | null) => void;
  setLunchRestEndTime: (value: Dayjs | null) => void;
}

const WorkingTimeSection = ({
  startTime,
  endTime,
  lunchRestStartTime,
  lunchRestEndTime,
  setStartTime,
  setEndTime,
  setLunchRestStartTime,
  setLunchRestEndTime,
}: WorkingTimeSectionProps) => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-2">
      <p className="text-sm text-slate-500">
        所定の勤務時間を設定してください。
      </p>
      <div className="flex flex-row flex-wrap items-end gap-4">
        <SettingsTimeField
          label="開始時間"
          value={startTime}
          onChange={setStartTime}
          className="w-full max-w-[200px]"
        />
        <span className="text-base text-slate-800">〜</span>
        <SettingsTimeField
          label="終了時間"
          value={endTime}
          onChange={setEndTime}
          className="w-full max-w-[200px]"
        />
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <p className="text-sm text-slate-500">
        昼休憩時間を設定してください。
      </p>
      <div className="flex flex-row flex-wrap items-end gap-4">
        <SettingsTimeField
          label="開始時間"
          value={lunchRestStartTime}
          onChange={setLunchRestStartTime}
          className="w-full max-w-[200px]"
        />
        <span className="text-base text-slate-800">〜</span>
        <SettingsTimeField
          label="終了時間"
          value={lunchRestEndTime}
          onChange={setLunchRestEndTime}
          className="w-full max-w-[200px]"
        />
      </div>
    </div>
  </div>
);

export default WorkingTimeSection;
