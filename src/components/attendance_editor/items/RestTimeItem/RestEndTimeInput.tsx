import { Stack } from "@mui/material";
import { useContext } from "react";
import { FieldArrayWithId } from "react-hook-form";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AttendanceDateTime } from "@/lib/AttendanceDateTime";
import { AttendanceEditContext } from "@/pages/AttendanceEdit/AttendanceEditProvider";
import { AttendanceEditInputs } from "@/pages/AttendanceEdit/common";

import { CommonRestTimePicker } from "./CommonRestTimePicker";

export default function RestEndTimeInput({
  index,
  rest,
}: {
  index: number;
  rest: FieldArrayWithId<AttendanceEditInputs, "rests", "id">;
}) {
  const { workDate, control, restUpdate } = useContext(AttendanceEditContext);
  const { getLunchRestEndTime } = useContext(AppConfigContext);

  const lunchRestEndTime = getLunchRestEndTime().format("H:mm");

  if (!workDate || !control || !restUpdate) {
    return null;
  }

  return (
    <Stack direction="row" spacing={1}>
      <Stack spacing={1}>
        <CommonRestTimePicker
          name={`rests.${index}.endTime`}
          value={rest.endTime}
          workDate={workDate}
          control={control}
          rest={rest}
          index={index}
          restUpdate={restUpdate}
          chipLabel={lunchRestEndTime}
          onChipClick={() => {
            const endTime = new AttendanceDateTime()
              .setDate(workDate)
              .setRestEnd()
              .toISOString();
            restUpdate(index, { ...rest, endTime });
          }}
        />
      </Stack>
    </Stack>
  );
}
