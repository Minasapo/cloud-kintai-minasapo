import { useContext, useMemo } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";

import TimeInputBase from "./TimeInputBase";

export default function EndTimeInput({
  highlight = false,
}: { highlight?: boolean } = {}) {
  const { getQuickInputEndTimes } = useContext(AppConfigContext);
  const { workDate, control, setValue, isOnBreak } = useContext(
    AttendanceEditContext
  );

  // Derived state: compute quickInputEndTimes from getQuickInputEndTimes
  const quickInputEndTimes = useMemo(() => {
    const times = getQuickInputEndTimes(true);
    return times.map((entry) => ({
      time: entry.time,
      enabled: entry.enabled,
    }));
  }, [getQuickInputEndTimes]);

  if (!workDate || !control || !setValue) {
    return null;
  }

  return (
    <TimeInputBase<"endTime">
      name="endTime"
      control={control}
      setValue={setValue}
      workDate={workDate}
      quickInputTimes={quickInputEndTimes}
      chipColor={(enabled) => (enabled ? "success" : "default")}
      disabled={isOnBreak}
      highlight={highlight}
    />
  );
}
