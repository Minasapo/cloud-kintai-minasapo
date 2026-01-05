import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Box, Chip, Stack } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useContext } from "react";
import { Controller } from "react-hook-form";

import { AttendanceEditContext } from "@/pages/attendance/edit/AttendanceEditProvider";

import {
  AttendanceControl,
  AttendanceFieldValue,
  AttendanceSetValue,
  AttendanceTimeFieldName,
} from "../../types";

interface TimeInputBaseProps<TFieldName extends AttendanceTimeFieldName> {
  name: TFieldName;
  control: AttendanceControl;
  setValue: AttendanceSetValue;
  workDate: dayjs.Dayjs;
  quickInputTimes: { time: string; enabled: boolean }[];
  chipColor?: (enabled: boolean) => "success" | "default";
  disabled?: boolean;
  highlight?: boolean;
}

export default function TimeInputBase<
  TFieldName extends AttendanceTimeFieldName
>({
  name,
  control,
  setValue,
  workDate,
  quickInputTimes,
  chipColor = (enabled) => (enabled ? "success" : "default"),
  disabled = false,
    highlight = false,
}: TimeInputBaseProps<TFieldName>) {
  const { readOnly } = useContext(AttendanceEditContext);
  if (!workDate || !control || !setValue) return null;

  return (
    <Stack direction="row" spacing={1}>
      <Stack spacing={1}>
        <Controller
            key={highlight ? "highlight-on" : "highlight-off"}
          name={name}
          control={control}
          render={({ field }) => (
            <TimePicker
              ampm={false}
              value={(() => (field.value ? dayjs(field.value) : null))()}
              slotProps={{
                  textField: {
                    size: "small",
                    sx: highlight
                      ? {
                          "& .MuiOutlinedInput-root": {
                            animation: "highlightPulse 2.5s ease-in-out",
                            "@keyframes highlightPulse": {
                              "0%, 100%": {
                                backgroundColor: "transparent",
                                borderColor: "rgba(0, 0, 0, 0.23)",
                              },
                              "15%, 50%": {
                                backgroundColor: "#FFE082",
                                borderColor: "#FFC107",
                                boxShadow: "0 0 12px rgba(255, 193, 7, 0.6)",
                              },
                              "85%": {
                                backgroundColor: "#FFF9C4",
                                borderColor: "#FFC107",
                                boxShadow: "0 0 8px rgba(255, 193, 7, 0.4)",
                              },
                            },
                          },
                        }
                      : undefined,
                  },
              }}
              disabled={!!readOnly || disabled}
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
                const nextValue = formatted as AttendanceFieldValue<TFieldName>;
                field.onChange(nextValue);
                setValue(
                  name as AttendanceTimeFieldName,
                  nextValue as AttendanceFieldValue<AttendanceTimeFieldName>
                );
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
                if (readOnly || disabled) return;
                const time = dayjs(
                  `${workDate.format("YYYY-MM-DD")} ${entry.time}`
                ).toISOString();
                const nextValue = time as AttendanceFieldValue<TFieldName>;
                setValue(
                  name as AttendanceTimeFieldName,
                  nextValue as AttendanceFieldValue<AttendanceTimeFieldName>
                );
              }}
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
        </Box>
      </Stack>
    </Stack>
  );
}
