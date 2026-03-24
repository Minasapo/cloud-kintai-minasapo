import useAppConfig from "@entities/app-config/model/useAppConfig";
import { useContext, useMemo, useState } from "react";

import { AttendanceDateTime } from "@/entities/attendance/lib/AttendanceDateTime";
import { resolveConfigTimeOnDate } from "@/entities/attendance/lib/resolveConfigTimeOnDate";
import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";

type TimeField = "startTime" | "endTime";

type UseAutoConfiguredTimeFlagOptions = {
  timeField: TimeField;
  highlightDurationMs?: number;
};

export function useAutoConfiguredTimeFlag({
  timeField,
  highlightDurationMs = 2500,
}: UseAutoConfiguredTimeFlagOptions) {
  const { control, setValue, workDate, getValues, attendance } = useContext(
    AttendanceEditContext,
  );
  const { getStartTime, getEndTime } = useAppConfig();
  const [highlighted, setHighlighted] = useState(false);

  const isStartTime = timeField === "startTime";

  const disabled = useMemo(
    () => !control || !setValue,
    [control, setValue],
  );

  const computeIsoTime = () => {
    if (isStartTime) {
      return resolveConfigTimeOnDate(
        getStartTime(),
        getValues?.("startTime") as string | null | undefined,
        workDate ?? undefined,
        attendance?.workDate,
      );
    }

    if (!workDate) {
      return null;
    }

    const configured = getEndTime();
    const dt = new AttendanceDateTime().setDate(workDate);
    dt.date = dt.date
      .hour(configured.hour())
      .minute(configured.minute())
      .second(0)
      .millisecond(0);
    return dt.toISOString();
  };

  const applyConfiguredTime = (checked: boolean) => {
    if (!checked || !setValue) {
      return;
    }

    const nextValue = computeIsoTime();
    if (!nextValue) {
      return;
    }

    setValue(timeField, nextValue);
    setHighlighted(true);
    setTimeout(() => setHighlighted(false), highlightDurationMs);
  };

  return {
    control,
    disabled,
    highlighted,
    applyConfiguredTime,
  };
}
