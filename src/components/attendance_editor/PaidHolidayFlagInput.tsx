import { Box, Checkbox, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import dayjs from "dayjs";
import {
  Control,
  Controller,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";

import useAppConfig from "@/hooks/useAppConfig/useAppConfig";

import PaidHolidayFlagInputMobile from "./PaidHolidayFlagInputMobile";

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

export default function PaidHolidayFlagInput({
  label = "有給休暇",
  disabled = false,
  control,
  setValue,
  workDate,
  setPaidHolidayTimes = false,
  restReplace,
  getValues,
}: PaidHolidayFlagInputProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    getStartTime,
    getEndTime,
    getLunchRestStartTime,
    getLunchRestEndTime,
  } = useAppConfig();

  if (isMobile) {
    return (
      <PaidHolidayFlagInputMobile
        {...{
          label,
          disabled,
          control,
          setValue,
          workDate,
          setPaidHolidayTimes,
          restReplace,
          getValues,
        }}
      />
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    setValue("paidHolidayFlag", e.target.checked);
    field.onChange(e);

    if (!e.target.checked || !setPaidHolidayTimes || !workDate) return;

    const workDayjs = dayjs(workDate);

    // compose times using AppConfig getters
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

    // 有給ON時は特別休暇フラグを解除して相互排他にする
    try {
      if (getValues && getValues("specialHolidayFlag")) {
        setValue("specialHolidayFlag", false);
      }
    } catch (e) {
      // noop
    }

    // 備考欄に「有給休暇」を追記（既に含まれている場合は追加しない）
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
