import QuickInputChips from "@shared/ui/inputs/QuickInputChips";
import { TimeInput } from "@shared/ui/TimeInput";
import { useContext, useMemo } from "react";
import { Controller } from "react-hook-form";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";

export default function StartTimeInput({
  dataTestId = "start-time-input",
  highlight = false,
}: {
  dataTestId?: string;
  highlight?: boolean;
} = {}) {
  const { workDate, control, setValue, changeRequests, readOnly } = useContext(
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

  if (!workDate || !control || !setValue) return null;

  return (
    <div className="flex flex-col gap-2">
      <Controller
        key={highlight ? "highlight-on" : "highlight-off"}
        name="startTime"
        control={control}
        render={({ field }) => (
          <TimeInput
            value={field.value ?? null}
            baseDate={workDate.format("YYYY-MM-DD")}
            disabled={changeRequests.length > 0 || !!readOnly}
            size="small"
            step={60}
            data-testid={dataTestId}
            className={
              highlight
                ? "border-amber-400 bg-amber-50 shadow-[0_0_0_3px_rgba(251,191,36,0.25)]"
                : undefined
            }
            onChange={(value) => field.onChange(value)}
          />
        )}
      />
      <div>
        <QuickInputChips
          quickInputTimes={quickInputStartTimes}
          workDate={workDate}
          disabled={changeRequests.length > 0 || !!readOnly}
          onSelectTime={(startTime) =>
            setValue("startTime", startTime, { shouldDirty: true })
          }
        />
      </div>
    </div>
  );
}
