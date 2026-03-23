import QuickInputChips from "@shared/ui/inputs/QuickInputChips";
import { TimeInput } from "@shared/ui/TimeInput";
import { useContext, useMemo } from "react";
import { Controller } from "react-hook-form";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";

export default function EndTimeInput({
  dataTestId = "end-time-input",
  highlight = false,
}: { dataTestId?: string; highlight?: boolean } = {}) {
  const { getQuickInputEndTimes } = useContext(AppConfigContext);
  const { workDate, control, setValue, changeRequests, readOnly, isOnBreak } =
    useContext(AttendanceEditContext);

  // Derived state: compute quickInputEndTimes from getQuickInputEndTimes
  const quickInputEndTimes = useMemo(() => {
    const quickInputTimes = getQuickInputEndTimes(true);
    if (quickInputTimes.length > 0) {
      return quickInputTimes.map((entry) => ({
        time: entry.time,
        enabled: entry.enabled,
      }));
    }
    return [];
  }, [getQuickInputEndTimes]);

  if (!workDate || !control || !setValue) return null;

  return (
    <div className="flex flex-col gap-2">
        <Controller
          key={highlight ? "highlight-on" : "highlight-off"}
          name="endTime"
          control={control}
          render={({ field }) => (
            <TimeInput
              value={field.value ?? null}
              baseDate={workDate.format("YYYY-MM-DD")}
              disabled={changeRequests.length > 0 || !!readOnly || isOnBreak}
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
            quickInputTimes={quickInputEndTimes}
            workDate={workDate}
            disabled={changeRequests.length > 0 || !!readOnly || isOnBreak}
            onSelectTime={(endTime) =>
              setValue("endTime", endTime, { shouldDirty: true })
            }
          />
        </div>
    </div>
  );
}
