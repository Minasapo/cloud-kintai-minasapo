import { useContext, useMemo } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";
import TimeInputBase from "@/features/attendance/edit/ui/items/WorkTimeItem/TimeInputBase";

export default function StartTimeInputMobile({
  dataTestId = "mobile-start-time-input",
}: {
  dataTestId?: string;
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
    <TimeInputBase<"startTime">
      name="startTime"
      control={control}
      setValue={setValue}
      workDate={workDate}
      quickInputTimes={quickInputStartTimes}
      disabled={changeRequests.length > 0 || !!readOnly}
      dataTestId={dataTestId}
    />
  );
}
