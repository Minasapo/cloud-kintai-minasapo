import { useContext } from "react";

import PaidHolidayFlagInputCommon from "@/components/attendance_editor/PaidHolidayFlagInput";

import { AttendanceEditContext } from "../AttendanceEditProvider";

export default function PaidHolidayFlagInput() {
  const {
    control,
    changeRequests,
    setValue,
    restReplace,
    getValues,
    workDate,
  } = useContext(AttendanceEditContext);
  if (!control || !setValue) return null;
  return (
    <PaidHolidayFlagInputCommon
      label="有給休暇(1日)"
      control={control}
      setValue={setValue}
      workDate={workDate ? workDate.format("YYYY-MM-DD") : undefined}
      restReplace={restReplace}
      getValues={getValues}
      setPaidHolidayTimes={true}
      disabled={changeRequests.length > 0}
    />
  );
}
