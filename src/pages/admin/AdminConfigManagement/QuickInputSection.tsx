import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { Dayjs } from "dayjs";

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
  <>
    <Typography variant="h5">簡単時間入力</Typography>
    <Typography variant="body1" color="textSecondary">
      勤怠編集画面でボタンを押すと時刻が簡単に入力されます。
      <br />
      この機能は、勤務開始時刻と勤務終了時刻のみを設定できます。
    </Typography>
    <Stack direction="row" spacing={4}>
      <Stack spacing={2} sx={{ flex: 1 }}>
        <Typography variant="subtitle1">出勤時間</Typography>
        {quickInputStartTimes.map((entry, index) => (
          <Stack direction="row" spacing={2} alignItems="center" key={index}>
            <TimePicker
              label={`出勤時間 ${index + 1}`}
              ampm={false}
              value={entry.time}
              views={["hours", "minutes"]}
              format="HH:mm"
              slotProps={{
                textField: { size: "small" },
              }}
              sx={{ flex: 1 }}
              onChange={(newValue) =>
                onQuickInputStartTimeChange(index, newValue)
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={entry.enabled}
                  onChange={() => onQuickInputStartTimeToggle(index)}
                />
              }
              label="有効"
            />
            <IconButton
              onClick={() => onRemoveQuickInputStartTime(index)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        ))}
        <Button
          variant="text"
          size="small"
          onClick={onAddQuickInputStartTime}
          sx={{ alignSelf: "flex-start" }}
        >
          出勤時間を追加
        </Button>
      </Stack>
      <Stack spacing={2} sx={{ flex: 1 }}>
        <Typography variant="subtitle1">退勤時間</Typography>
        {quickInputEndTimes.map((entry, index) => (
          <Stack direction="row" spacing={2} alignItems="center" key={index}>
            <TimePicker
              label={`退勤時間 ${index + 1}`}
              ampm={false}
              value={entry.time}
              views={["hours", "minutes"]}
              format="HH:mm"
              slotProps={{
                textField: { size: "small" },
              }}
              sx={{ flex: 1 }}
              onChange={(newValue) =>
                onQuickInputEndTimeChange(index, newValue)
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={entry.enabled}
                  onChange={() => onQuickInputEndTimeToggle(index)}
                />
              }
              label="有効"
            />
            <IconButton
              onClick={() => onRemoveQuickInputEndTime(index)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        ))}
        <Button
          variant="text"
          size="small"
          onClick={onAddQuickInputEndTime}
          sx={{ alignSelf: "flex-start" }}
        >
          退勤時間を追加
        </Button>
      </Stack>
    </Stack>
  </>
);

export default QuickInputSection;
