import { Switch } from "@mui/material";
import { useContext } from "react";

import { GoDirectlyFlagCheckbox } from "@/components/attendance_editor/GoDirectlyFlagCheckbox";
import useAppConfig from "@/hooks/useAppConfig/useAppConfig";

import { AttendanceEditContext } from "../AttendanceEditProvider";

export function GoDirectlyFlagInput() {
  const context = useContext(AttendanceEditContext);
  const control = context?.control;
  const setValue = context?.setValue;
  const { getStartTime } = useAppConfig();

  if (!control || !setValue) {
    return null;
  }

  return (
    <GoDirectlyFlagCheckbox
      name="goDirectlyFlag"
      control={control}
      inputComponent={Switch}
      onChangeExtra={(checked: boolean) => {
        if (checked) {
          setValue("goDirectlyFlag", true);
          setValue("startTime", getStartTime().toISOString());
        }
      }}
    />
  );
}
