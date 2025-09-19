import { Stack, Typography } from "@mui/material";
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
  renderTimeViewClock: any;
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
  renderTimeViewClock,
}: WorkingTimeSectionProps) => (
  <>
    <Typography variant="h6">勤務時間</Typography>
    <Typography variant="body2" color="textSecondary">
      所定の勤務時間を設定してください。
    </Typography>
    <Stack direction="row" spacing={2} alignItems="center">
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
      <Typography variant="body1">〜</Typography>
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
    </Stack>
    <Typography variant="h6">昼休憩時間</Typography>
    <Typography variant="body2" color="textSecondary">
      昼休憩時間を設定してください。
    </Typography>
    <Stack direction="row" spacing={2} alignItems="center">
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
      <Typography variant="body1">〜</Typography>
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
    </Stack>
  </>
);

export default WorkingTimeSection;
