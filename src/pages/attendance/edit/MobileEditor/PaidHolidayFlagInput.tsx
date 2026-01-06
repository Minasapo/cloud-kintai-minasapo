import PaidHolidayFlagInputCommon from "@features/attendance/edit/PaidHolidayFlagInput";
import { useContext } from "react";

import { AttendanceEditContext } from "../AttendanceEditProvider";

export function PaidHolidayFlagInput() {
  const context = useContext(AttendanceEditContext);
  const { control, setValue, restReplace, getValues } = context;

  if (!control) return null;

  return (
    <PaidHolidayFlagInputCommon
      label="有給休暇(1日)"
      control={control}
      setValue={setValue!}
      restReplace={restReplace}
      getValues={getValues}
      setPaidHolidayTimes={true}
    />
  );
}
