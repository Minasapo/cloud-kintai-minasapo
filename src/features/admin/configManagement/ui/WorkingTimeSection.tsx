
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { Dayjs } from "dayjs";

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
      <div className="flex flex-row gap-4 items-center">
        <TimePicker
          label="開始時間"
          ampm={false}
          value={startTime}
          views={["hours", "minutes"]}
          format="HH:mm"
          slotProps={{
            textField: { size: "small" },
          }}
          sx={{ maxWidth: 200 }}
          onChange={setStartTime}
        />
        <span className="text-base text-slate-800">〜</span>
        <TimePicker
          label="終了時間"
          ampm={false}
          value={endTime}
          views={["hours", "minutes"]}
          format="HH:mm"
          slotProps={{
            textField: { size: "small" },
          }}
          sx={{ maxWidth: 200 }}
          onChange={setEndTime}
        />
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <p className="text-sm text-slate-500">
        昼休憩時間を設定してください。
      </p>
      <div className="flex flex-row gap-4 items-center">
        <TimePicker
          label="開始時間"
          ampm={false}
          value={lunchRestStartTime}
          views={["hours", "minutes"]}
          format="HH:mm"
          slotProps={{
            textField: { size: "small" },
          }}
          sx={{ maxWidth: 200 }}
          onChange={setLunchRestStartTime}
        />
        <span className="text-base text-slate-800">〜</span>
        <TimePicker
          label="終了時間"
          ampm={false}
          value={lunchRestEndTime}
          views={["hours", "minutes"]}
          format="HH:mm"
          slotProps={{
            textField: { size: "small" },
          }}
          sx={{ maxWidth: 200 }}
          onChange={setLunchRestEndTime}
        />
      </div>
    </div>
  </div>
);

export default WorkingTimeSection;
