import { Box, Checkbox, Stack } from "@mui/material";
import dayjs from "dayjs";
import { Controller, UseFieldArrayReplace } from "react-hook-form";

import useAppConfig from "@/hooks/useAppConfig/useAppConfig";
import {
  AttendanceEditInputs,
  RestInputs,
} from "@/pages/attendance/edit/common";
import { Label } from "@/pages/attendance/edit/MobileEditor/Label";

import {
  AttendanceControl,
  AttendanceControllerField,
  AttendanceGetValues,
  AttendanceSetValue,
} from "../model/types";

type PaidHolidayFlagField = AttendanceControllerField<"paidHolidayFlag">;

interface PaidHolidayFlagInputProps {
  label?: string;
  disabled?: boolean;
  control: AttendanceControl;
  setValue: AttendanceSetValue;
  workDate?: string;
  setPaidHolidayTimes?: boolean;
  restReplace?: UseFieldArrayReplace<AttendanceEditInputs, "rests">;
  getValues?: AttendanceGetValues;
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
  const {
    getStartTime,
    getEndTime,
    getLunchRestStartTime,
    getLunchRestEndTime,
  } = useAppConfig();

  if (!control || !setValue) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: PaidHolidayFlagField
  ) => {
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
    const rests: RestInputs[] = [
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
    } catch {
      // noop
    }

    // 有給ON時は特別休暇フラグを解除して相互排他にする
    try {
      if (getValues && getValues("specialHolidayFlag")) {
        setValue("specialHolidayFlag", false);
      }
    } catch {
      // noop
    }
  };

  return (
    <>
      <Label variant="body1">{label}</Label>
      <Stack direction="column" alignItems={"flex-start"} spacing={1}>
        <Box sx={{ color: "text.secondary", fontSize: 14 }}>
          1日有給を取得する場合はチェックを入れてください。既定の勤務開始／終了時刻と休憩がセットされます。
        </Box>
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
