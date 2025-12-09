import { useContext, useEffect, useState } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AttendanceEditContext } from "@/pages/attendance/edit/AttendanceEditProvider";

import TimeInputBase from "./TimeInputBase";

export default function EndTimeInput() {
  const { getQuickInputEndTimes } = useContext(AppConfigContext);
  const { workDate, control, setValue } = useContext(AttendanceEditContext);
  if (!workDate) return null;

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

  if (!control || !setValue) {
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
    />
  );
}
