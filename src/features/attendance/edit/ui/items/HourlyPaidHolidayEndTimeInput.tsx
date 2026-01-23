import { FieldArrayWithId } from "react-hook-form";

import { AttendanceEditInputs } from "@/features/attendance/edit/model/common";

import HourlyPaidHolidayTimeInput from "./HourlyPaidHolidayTimeInput";

export default function HourlyPaidHolidayEndTimeInput({
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
      fieldKey="endTime"
      label="終了時刻"
    />
  );
}
