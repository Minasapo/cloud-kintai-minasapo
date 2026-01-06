import { useContext, useEffect, useState } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AttendanceEditContext } from "@/pages/attendance/edit/AttendanceEditProvider";

import TimeInputBase from "./TimeInputBase";

export default function EndTimeInput({
  highlight = false,
}: { highlight?: boolean } = {}) {
  const { getQuickInputEndTimes } = useContext(AppConfigContext);
  const { workDate, control, setValue, isOnBreak } = useContext(
    AttendanceEditContext
  );

  const [quickInputEndTimes, setQuickInputEndTimes] = useState<
    { time: string; enabled: boolean }[]
  >([]);

  useEffect(() => {
    const quickInputEndTimes = getQuickInputEndTimes(true);
    setQuickInputEndTimes(
      quickInputEndTimes.map((entry) => ({
        time: entry.time,
        enabled: entry.enabled,
      }))
    );
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
