import { GoDirectlyFlagCheckbox } from "@features/attendance/edit/GoDirectlyFlagCheckbox";
import { Switch } from "@mui/material";
import { useContext } from "react";

import useAppConfig from "@/hooks/useAppConfig/useAppConfig";
import { resolveConfigTimeOnDate } from "@/lib/resolveConfigTimeOnDate";

import { AttendanceEditContext } from "../AttendanceEditProvider";

export function GoDirectlyFlagInput() {
  const { control, setValue, workDate, getValues, attendance } = useContext(
    AttendanceEditContext
  );
  const { getStartTime } = useAppConfig();

  if (!control || !setValue) {
    return null;
  }

  const computeStartTimeIso = () =>
    resolveConfigTimeOnDate(
      getStartTime(),
      getValues?.("startTime") as string | null | undefined,
      workDate ?? undefined,
      attendance?.workDate
    );

  return (
    <GoDirectlyFlagCheckbox
      name="goDirectlyFlag"
      control={control}
      inputComponent={Switch}
      onChangeExtra={(checked: boolean) => {
        if (checked) {
          setValue("goDirectlyFlag", true);
          setValue("startTime", computeStartTimeIso());
        }
      }}
    />
  );
}
