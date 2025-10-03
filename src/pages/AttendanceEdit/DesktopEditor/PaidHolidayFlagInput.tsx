import { useContext } from "react";

import PaidHolidayFlagInputCommon from "@/components/attendance_editor/PaidHolidayFlagInput";

import { AttendanceEditContext } from "../AttendanceEditProvider";

export default function PaidHolidayFlagInput() {
  const { control, changeRequests } = useContext(AttendanceEditContext);
  if (!control) return null;
  return (
    <PaidHolidayFlagInputCommon
      label="有給休暇(1日)"
      control={control}
      setValue={() => {}}
      disabled={changeRequests.length > 0}
    />
  );
}
