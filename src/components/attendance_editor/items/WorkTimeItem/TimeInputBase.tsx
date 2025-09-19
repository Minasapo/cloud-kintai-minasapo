import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Box, Chip, Stack } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { Controller } from "react-hook-form";

import { AttendanceEditInputs } from "@/pages/AttendanceEdit/common";

interface TimeInputBaseProps<K extends keyof AttendanceEditInputs> {
  name: K;
  control: any;
  setValue: (name: K, value: any) => void;
  workDate: dayjs.Dayjs;
  quickInputTimes: { time: string; enabled: boolean }[];
  chipColor?: (enabled: boolean) => "success" | "default";
}

export default function TimeInputBase<K extends keyof AttendanceEditInputs>({
  name,
  control,
  setValue,
  workDate,
  quickInputTimes,
  chipColor = (enabled) => (enabled ? "success" : "default"),
}: TimeInputBaseProps<K>) {
  if (!workDate || !control || !setValue) return null;

  return (
    <Stack direction="row" spacing={1}>
      <Stack spacing={1}>
        <Controller
          name={name as string}
          control={control}
          render={({ field }) => (
            <TimePicker
              ampm={false}
              value={(() => (field.value ? dayjs(field.value) : null))()}
              slotProps={{
                textField: { size: "small" },
              }}
              onChange={(value) => {
                if (value && !value.isValid()) return;
                const formatted = (() => {
                  if (!value) return null;
                  return value
                    .year(workDate.year())
                    .month(workDate.month())
                    .date(workDate.date())
                    .second(0)
                    .millisecond(0)
                    .toISOString();
                })();
                field.onChange(formatted);
                setValue(name, formatted);
              }}
            />
          )}
        />
        <Box>
          {quickInputTimes.map((entry, index) => (
            <Chip
              key={index}
              label={entry.time}
              color={chipColor(entry.enabled)}
              variant="outlined"
              icon={<AddCircleOutlineOutlinedIcon fontSize="small" />}
              onClick={() => {
                const time = dayjs(
                  `${workDate.format("YYYY-MM-DD")} ${entry.time}`
                ).toISOString();
                setValue(name, time);
              }}
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
        </Box>
      </Stack>
    </Stack>
  );
}
