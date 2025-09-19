import { Switch } from "@mui/material";
import { useContext } from "react";

import ReturnDirectlyFlagInputBase from "@/components/common/ReturnDirectlyFlagInputBase";
import useAppConfig from "@/hooks/useAppConfig/useAppConfig";

import { AttendanceEditContext } from "../AttendanceEditProvider";

export function ReturnDirectlyFlagInput() {
  const context = useContext(AttendanceEditContext);
  const control = context?.control;
  const setValue = context?.setValue;
  const { getEndTime } = useAppConfig();

  if (!control || !setValue) {
    return null;
  }

  return (
    <ReturnDirectlyFlagInputBase
      control={control}
      inputComponent={Switch}
      layout="inline"
      onChangeFlag={(checked) => {
        if (checked) {
          setValue("returnDirectlyFlag", true);
          setValue("endTime", getEndTime().toISOString());
        }
      }}
    />
  );
}
