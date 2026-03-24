import QuickInputChips from "@shared/ui/inputs/QuickInputChips";
import { TimeInput } from "@shared/ui/TimeInput";
import type { Dayjs } from "dayjs";
import { useContext, useMemo } from "react";
import { UseFormSetValue } from "react-hook-form";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";
import { AttendanceEditInputs } from "@/features/attendance/edit/model/common";

/**
 * 勤務終了時刻の入力コンポーネント（モバイル用）。
 */
export default function EndTimeInput({
  workDate,
  setValue,
}: {
  workDate: Dayjs | null;
  setValue: UseFormSetValue<AttendanceEditInputs>;
}) {
  const { getQuickInputEndTimes } = useContext(AppConfigContext);

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

  const { watch, readOnly, isOnBreak } = useContext(AttendanceEditContext);
  if (!workDate) return null;

  const endTime = watch ? (watch("endTime") ?? null) : null;

  return (
    <div className="flex flex-col gap-2">
        <TimeInput
          value={endTime}
          baseDate={workDate.format("YYYY-MM-DD")}
          size="small"
          step={60}
          disabled={!!readOnly || isOnBreak}
          onChange={(value) => {
            setValue("endTime", value, { shouldDirty: true });
          }}
        />
        <div>
          <QuickInputChips
            quickInputTimes={quickInputEndTimes}
            workDate={workDate}
            disabled={!!readOnly || isOnBreak}
            onSelectTime={(endTime) => {
              if (readOnly || isOnBreak) return;
              setValue("endTime", endTime, { shouldDirty: true });
            }}
          />
        </div>
    </div>
  );
}
