import QuickInputChips from "@shared/ui/inputs/QuickInputChips";
import { TimeInput } from "@shared/ui/TimeInput";
import { useContext, useMemo } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";

export default function StartTimeInputMobile({
  dataTestId = "mobile-start-time-input",
}: {
  dataTestId?: string;
} = {}) {
  const { workDate, setValue, watch, changeRequests, readOnly } = useContext(
    AttendanceEditContext
  );
  const { getQuickInputStartTimes } = useContext(AppConfigContext);

  // Derived state: compute quickInputStartTimes from getQuickInputStartTimes
  const quickInputStartTimes = useMemo(() => {
    const times = getQuickInputStartTimes(true);
    return times.map((entry) => ({
      time: entry.time,
      enabled: entry.enabled,
    }));
  }, [getQuickInputStartTimes]);

  if (!workDate || !setValue) return null;

  const startTime = watch ? (watch("startTime") ?? null) : null;

  return (
    <div className="flex flex-col gap-2">
      <TimeInput
        value={startTime}
        baseDate={workDate.format("YYYY-MM-DD")}
        size="small"
        step={60}
        data-testid={dataTestId}
        disabled={changeRequests.length > 0 || !!readOnly}
        onChange={(value) => {
          setValue("startTime", value, { shouldDirty: true });
        }}
      />
      <div>
        <QuickInputChips
          quickInputTimes={quickInputStartTimes}
          workDate={workDate}
          disabled={changeRequests.length > 0 || !!readOnly}
          onSelectTime={(startTime) => {
            if (readOnly) return;
            setValue("startTime", startTime, { shouldDirty: true });
          }}
        />
      </div>
    </div>
  );
}
