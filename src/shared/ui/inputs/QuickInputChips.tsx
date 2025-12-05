import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Chip, Stack } from "@mui/material";
import dayjs, { type Dayjs } from "dayjs";

export interface QuickInputTime {
  time: string;
  enabled: boolean;
}

interface QuickInputChipsProps {
  quickInputTimes: QuickInputTime[];
  workDate: Dayjs;
  disabled?: boolean;
  onSelectTime: (isoString: string) => void;
}

export default function QuickInputChips({
  quickInputTimes,
  workDate,
  disabled = false,
  onSelectTime,
}: QuickInputChipsProps) {
  return (
    <Stack direction="row" spacing={1}>
      {quickInputTimes.map((entry, index) => (
        <Chip
          key={index}
          label={entry.time}
          color={entry.enabled ? "success" : "default"}
          variant="outlined"
          icon={<AddCircleOutlineOutlinedIcon fontSize="small" />}
          disabled={disabled}
          onClick={() => {
            const endTime = dayjs(
              `${workDate.format("YYYY-MM-DD")} ${entry.time}`
            ).toISOString();
            onSelectTime(endTime);
          }}
        />
      ))}
    </Stack>
  );
}
