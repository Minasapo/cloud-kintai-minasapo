import QuickInputChips from "@shared/ui/inputs/QuickInputChips";
import { TimeInput } from "@shared/ui/TimeInput";
import { useContext } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";
import { RestInputs } from "@/features/attendance/edit/model/common";

export default function RestStartTimeInputMobile({
  rest,
  index,
  testIdPrefix = "mobile",
}: {
  rest: RestInputs;
  index: number;
  testIdPrefix?: string;
}) {
  const { workDate, restUpdate, changeRequests } = useContext(
    AttendanceEditContext
  );
  const { getLunchRestStartTime } = useContext(AppConfigContext);

  if (!workDate || !restUpdate) return null;

  return (
    <div className="flex flex-col gap-2">
      <TimeInput
        value={rest.startTime ?? null}
        baseDate={workDate.format("YYYY-MM-DD")}
        size="small"
        step={60}
        data-testid={"rest-start-time-input-" + testIdPrefix + "-" + index}
        disabled={changeRequests.length > 0}
        onChange={(value) => {
          restUpdate(index, { ...rest, startTime: value });
        }}
      />
      <div>
        <QuickInputChips
          quickInputTimes={[{ time: getLunchRestStartTime().format("HH:mm"), enabled: true }]}
          workDate={workDate}
          disabled={changeRequests.length > 0}
          onSelectTime={(startTime) => {
            restUpdate(index, { ...rest, startTime });
          }}
        />
      </div>
    </div>
  );
}
