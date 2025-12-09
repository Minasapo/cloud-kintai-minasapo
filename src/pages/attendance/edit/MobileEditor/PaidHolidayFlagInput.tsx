import PaidHolidayFlagInputCommon from "@features/attendance/edit/PaidHolidayFlagInput";
import { useContext } from "react";

import { AttendanceEditContext } from "../AttendanceEditProvider";

export function PaidHolidayFlagInput() {
  const { control } = useContext(AttendanceEditContext);
  if (!control) return null;
  return (
    <PaidHolidayFlagInputCommon
      label="有給休暇(1日)"
      control={control}
      setValue={useContext(AttendanceEditContext).setValue!}
      restReplace={useContext(AttendanceEditContext).restReplace}
      getValues={useContext(AttendanceEditContext).getValues}
      setPaidHolidayTimes={true}
    />
  );
}
