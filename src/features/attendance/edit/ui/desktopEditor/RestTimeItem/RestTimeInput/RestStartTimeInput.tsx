import QuickInputChips from "@shared/ui/inputs/QuickInputChips";
import { TimeInput } from "@shared/ui/TimeInput";
import { useContext } from "react";
import { Controller, FieldArrayWithId } from "react-hook-form";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";
import { AttendanceEditInputs } from "@/features/attendance/edit/model/common";

type RestStartTimeInputProp = {
  rest: FieldArrayWithId<AttendanceEditInputs, "rests", "id">;
  index: number;
  testIdPrefix?: string;
};

export default function RestStartTimeInput({
  rest,
  index,
  testIdPrefix = "desktop",
}: RestStartTimeInputProp) {
  const { workDate, changeRequests, control, restUpdate } = useContext(
    AttendanceEditContext
  );
  const { getLunchRestStartTime } = useContext(AppConfigContext);

  if (!workDate || !control || !restUpdate) return null;

  const lunchRestStartTime = getLunchRestStartTime().format("HH:mm");

  return (
    <div className="flex flex-col gap-2">
      <Controller
        name={`rests.${index}.startTime`}
        control={control}
        render={({ field }) => (
          <TimeInput
            value={field.value ?? null}
            baseDate={workDate.format("YYYY-MM-DD")}
            disabled={changeRequests.length > 0}
            size="small"
            step={60}
            data-testid={`rest-start-time-input-${testIdPrefix}-${index}`}
            onChange={(newStartTime) => field.onChange(newStartTime)}
          />
        )}
      />
      <div>
        <QuickInputChips
          quickInputTimes={[{ time: lunchRestStartTime, enabled: true }]}
          workDate={workDate}
          disabled={changeRequests.length > 0}
          data-testid={`rest-lunch-chip-${index}`}
          onSelectTime={(startTime) => {
            restUpdate(index, { ...rest, startTime });
          }}
        />
      </div>
    </div>
  );
}
