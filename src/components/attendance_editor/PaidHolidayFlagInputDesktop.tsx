import { Box, Checkbox, Stack } from "@mui/material";
import dayjs from "dayjs";
import {
  Control,
  Controller,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";

import { AttendanceDateTime } from "@/lib/AttendanceDateTime";

interface PaidHolidayFlagInputProps {
  label?: string;
  disabled?: boolean;
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  workDate?: string;
  setPaidHolidayTimes?: boolean;
  restReplace?: (
    items: { startTime: string | null; endTime: string | null }[]
  ) => void;
  getValues?: UseFormGetValues<any>;
}

export default function PaidHolidayFlagInputDesktop({
  label = "有給休暇",
  disabled = false,
  control,
  setValue,
  workDate,
  setPaidHolidayTimes = false,
  restReplace,
  getValues,
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
    const rests = [
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
    ];

    if (restReplace && typeof restReplace === "function") {
      restReplace(rests);
    } else {
      setValue("rests", rests);
    }

    try {
      if (getValues) {
        // remove special holiday tag if present (mutual exclusion)
        try {
          const special = (getValues("specialHolidayFlag") as boolean) || false;
          if (special) {
            setValue("specialHolidayFlag", false);
          }
        } catch (e) {
          // noop
        }

        const tags: string[] = (getValues("remarkTags") as string[]) || [];
        if (!tags.includes("有給休暇")) {
          setValue("remarkTags", [...tags, "有給休暇"]);
        }
      }
    } catch (e) {
      // noop
    }
  };

  return (
    <Stack direction="row" alignItems={"center"}>
      <Box sx={{ fontWeight: "bold", width: "150px" }}>{label}</Box>
      <Box>
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
      </Box>
    </Stack>
  );
}
