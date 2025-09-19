import { useContext, useEffect, useState } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AttendanceEditContext } from "@/pages/AttendanceEdit/AttendanceEditProvider";

import TimeInputBase from "./TimeInputBase";

export default function StartTimeInput() {
  const { workDate, control, setValue } = useContext(AttendanceEditContext);
  const { getQuickInputStartTimes } = useContext(AppConfigContext);
  const [quickInputStartTimes, setQuickInputStartTimes] = useState<
    { time: string; enabled: boolean }[]
  >([]);

  useEffect(() => {
    const quickInputStartTimes = getQuickInputStartTimes(true);
    setQuickInputStartTimes(
      quickInputStartTimes.map((entry) => ({
        time: entry.time,
        enabled: entry.enabled,
      }))
    );
  }, [getQuickInputStartTimes]);

  if (!workDate || !control || !setValue) {
    return null;
  }

  return (
    <TimeInputBase<"startTime">
      name="startTime"
      control={control}
      setValue={setValue}
      workDate={workDate}
      quickInputTimes={quickInputStartTimes}
      chipColor={() => "success"}
    />
  );
}
