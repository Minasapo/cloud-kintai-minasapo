import { FieldArrayWithId } from "react-hook-form";

import { AttendanceEditInputs } from "@/pages/attendance/edit/common";

import HourlyPaidHolidayTimeInput from "./HourlyPaidHolidayTimeInput";

export default function HourlyPaidHolidayStartTimeInput({
  index,
  time,
}: {
  index: number;
  time: FieldArrayWithId<AttendanceEditInputs, "hourlyPaidHolidayTimes", "id">;
}) {
  return (
    <HourlyPaidHolidayTimeInput
      index={index}
      time={time}
      fieldKey="startTime"
      label="開始時刻"
    />
  );
}
