import { Stack } from "@mui/material";
import { renderTimeViewClock, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useContext } from "react";
import { Controller, FieldArrayWithId } from "react-hook-form";

import { AttendanceEditContext } from "@/pages/AttendanceEdit/AttendanceEditProvider";
import { AttendanceEditInputs } from "@/pages/AttendanceEdit/common";

interface HourlyPaidHolidayTimeInputProps {
  index: number;
  time: FieldArrayWithId<AttendanceEditInputs, "hourlyPaidHolidayTimes", "id">;
  fieldKey: "startTime" | "endTime";
  label?: string;
}

export default function HourlyPaidHolidayTimeInput({
  index,
  time,
  fieldKey,
  label,
}: HourlyPaidHolidayTimeInputProps) {
  const { workDate, control, hourlyPaidHolidayTimeUpdate } = useContext(
    AttendanceEditContext
  );

  if (!workDate || !control) {
    return null;
  }

  return (
    <Stack spacing={1}>
      <Controller
        name={`hourlyPaidHolidayTimes.${index}.${fieldKey}`}
        control={control}
        render={({ field }) => (
          <TimePicker
            value={field.value ? dayjs(field.value) : null}
            ampm={false}
            viewRenderers={{
              hours: renderTimeViewClock,
              minutes: renderTimeViewClock,
            }}
            slotProps={{ textField: { size: "small", label } }}
            onChange={(newTime) => {
              if (newTime && !newTime.isValid()) {
                return;
              }
            }}
            onAccept={(newTime) => {
              if (newTime && !newTime.isValid()) {
                return;
              }

              const formattedTime = (() => {
                if (!newTime) return null;
                return newTime
                  .year(workDate.year())
                  .month(workDate.month())
                  .date(workDate.date())
                  .second(0)
                  .millisecond(0)
                  .toISOString();
              })();

              field.onChange(formattedTime);
              hourlyPaidHolidayTimeUpdate(index, {
                ...time,
                [fieldKey]: formattedTime,
              });
            }}
          />
        )}
      />
    </Stack>
  );
}
