import { Checkbox, Stack } from "@mui/material";
import dayjs from "dayjs";
import {
  Control,
  Controller,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";

import useAppConfig from "@/hooks/useAppConfig/useAppConfig";
import { Label } from "@/pages/AttendanceEdit/MobileEditor/Label";

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

export default function PaidHolidayFlagInputMobile({
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
  const {
    getStartTime,
    getEndTime,
    getLunchRestStartTime,
    getLunchRestEndTime,
  } = useAppConfig();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    setValue("paidHolidayFlag", e.target.checked);
    field.onChange(e);

    if (!e.target.checked || !setPaidHolidayTimes || !workDate) return;

    const workDayjs = dayjs(workDate);
    const cfgStart = getStartTime();
    const cfgEnd = getEndTime();
    const cfgRestStart = getLunchRestStartTime();
    const cfgRestEnd = getLunchRestEndTime();

    const startDt = workDayjs
      .hour(cfgStart.hour())
      .minute(cfgStart.minute())
      .second(0)
      .millisecond(0);
    const endDt = workDayjs
      .hour(cfgEnd.hour())
      .minute(cfgEnd.minute())
      .second(0)
      .millisecond(0);
    const restStartDt = workDayjs
      .hour(cfgRestStart.hour())
      .minute(cfgRestStart.minute())
      .second(0)
      .millisecond(0);
    const restEndDt = workDayjs
      .hour(cfgRestEnd.hour())
      .minute(cfgRestEnd.minute())
      .second(0)
      .millisecond(0);

    setValue("startTime", startDt.toISOString());
    setValue("endTime", endDt.toISOString());
    const rests = [
      {
        startTime: restStartDt.toISOString(),
        endTime: restEndDt.toISOString(),
      },
    ];

    if (restReplace && typeof restReplace === "function") {
      restReplace(rests);
    } else {
      setValue("rests", rests);
    }

    try {
      if (getValues) {
        const tags: string[] = (getValues("remarkTags") as string[]) || [];
        if (!tags.includes("有給休暇")) {
          setValue("remarkTags", [...tags, "有給休暇"]);
        }
      }
    } catch (e) {
      // noop
    }

    // 有給ON時は特別休暇フラグを解除して相互排他にする
    try {
      if (getValues && getValues("specialHolidayFlag")) {
        setValue("specialHolidayFlag", false);
      }
    } catch (e) {
      // noop
    }
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
