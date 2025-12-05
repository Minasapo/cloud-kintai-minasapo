import { Switch } from "@mui/material";
import ReturnDirectlyFlagInputBase from "@shared/ui/form/flags/ReturnDirectlyFlagInputBase";
import { useContext } from "react";

import useAppConfig from "@/hooks/useAppConfig/useAppConfig";
import { resolveConfigTimeOnDate } from "@/lib/resolveConfigTimeOnDate";

import { AttendanceEditContext } from "../AttendanceEditProvider";

export function ReturnDirectlyFlagInput() {
  const { control, setValue, workDate, getValues, attendance } = useContext(
    AttendanceEditContext
  );
  const { getEndTime } = useAppConfig();

  if (!control || !setValue) {
    return null;
  }

  const computeEndTimeIso = () =>
    resolveConfigTimeOnDate(
      getEndTime(),
      getValues?.("endTime") as string | null | undefined,
      workDate ?? undefined,
      attendance?.workDate
    );

  return (
    <ReturnDirectlyFlagInputBase
      control={control}
      inputComponent={Switch}
      layout="inline"
      onChangeFlag={(checked) => {
        if (checked) {
          setValue("returnDirectlyFlag", true);
          setValue("endTime", computeEndTimeIso());
        }
      }}
    />
  );
}
