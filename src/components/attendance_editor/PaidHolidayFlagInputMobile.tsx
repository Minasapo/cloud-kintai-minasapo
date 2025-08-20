import { Checkbox, Stack } from "@mui/material";
import dayjs from "dayjs";
import { Control, Controller, UseFormSetValue } from "react-hook-form";

import { AttendanceDateTime } from "@/lib/AttendanceDateTime";
import { Label } from "@/pages/AttendanceEdit/MobileEditor/Label";

interface PaidHolidayFlagInputProps {
  label?: string;
  disabled?: boolean;
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  workDate?: string;
  setPaidHolidayTimes?: boolean;
}

export default function PaidHolidayFlagInputMobile({
  label = "有給休暇",
  disabled = false,
  control,
  setValue,
  workDate,
  setPaidHolidayTimes = false,
}: PaidHolidayFlagInputProps) {
  if (!control || !setValue) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    setValue("paidHolidayFlag", e.target.checked);
    field.onChange(e);

    if (!e.target.checked || !setPaidHolidayTimes || !workDate) return;

    const workDayjs = dayjs(workDate);
    setValue(
      "startTime",
      new AttendanceDateTime().setDate(workDayjs).setWorkStart().toISOString()
    );
    setValue(
      "endTime",
      new AttendanceDateTime().setDate(workDayjs).setWorkEnd().toISOString()
    );
    setValue("rests", [
      {
        startTime: new AttendanceDateTime()
          .setDate(workDayjs)
          .setRestStart()
          .toISOString(),
        endTime: new AttendanceDateTime()
          .setDate(workDayjs)
          .setRestEnd()
          .toISOString(),
      },
    ]);
  };

  return (
    <>
      <Label variant="body1">{label}</Label>
      <Stack direction="column" alignItems={"flex-start"}>
        <Controller
          name="paidHolidayFlag"
          control={control}
          disabled={disabled}
          render={({ field }) => (
            <Checkbox
              {...field}
              checked={field.value || false}
              onChange={(e) => handleChange(e, field)}
            />
          )}
        />
      </Stack>
    </>
  );
}
