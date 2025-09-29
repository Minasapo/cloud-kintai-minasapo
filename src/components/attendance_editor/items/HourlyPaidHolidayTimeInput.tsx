import { Stack } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
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
  time: _time,
  fieldKey,
  label,
}: HourlyPaidHolidayTimeInputProps) {
  const {
    workDate,
    control,
    hourlyPaidHolidayTimeUpdate: _hourlyPaidHolidayTimeUpdate,
    changeRequests,
  } = useContext(AttendanceEditContext);

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
            disabled={changeRequests.length > 0}
            ampm={false}
            slotProps={{ textField: { size: "small", label } }}
            onChange={(newTime) => {
              if (!newTime) {
                // clear value when picker cleared
                field.onChange(null);
                return;
              }

              if (!newTime.isValid()) {
                // don't update form value until the typed value is a valid time
                return;
              }

              const formattedTime = newTime
                .year(workDate.year())
                .month(workDate.month())
                .date(workDate.date())
                .second(0)
                .millisecond(0)
                .toISOString();

              // update form value while typing so direct input (text) is reflected
              field.onChange(formattedTime);
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

              // update the controller value only; avoid calling the field array
              // update here to prevent overwriting other fields (eg. startTime)
              field.onChange(formattedTime);
            }}
          />
        )}
      />
    </Stack>
  );
}
