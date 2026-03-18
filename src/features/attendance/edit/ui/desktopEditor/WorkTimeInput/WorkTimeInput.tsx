import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";

import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";

import EndTimeInput from "./EndTimeInput";
import StartTimeInput from "./StartTimeInput";

export function calcTotalWorkTime(
  startTime: string | null | undefined,
  endTime: string | null | undefined
) {
  if (!startTime) return 0;

  const now = dayjs();
  const diff = dayjs(endTime || now).diff(dayjs(startTime), "hour", true);

  return diff;
}

interface WorkTimeInputProps {
  highlightStartTime?: boolean;
  highlightEndTime?: boolean;
}

export function WorkTimeInput({
  highlightStartTime = false,
  highlightEndTime = false,
}: WorkTimeInputProps) {
  const { workDate: targetWorkDate, watch } = useContext(AttendanceEditContext);
  const [totalWorkTime, setTotalWorkTime] = useState<number>(0);

  useEffect(() => {
    if (!watch) return;

    watch((data) => {
      const { startTime, endTime } = data;
      if (!startTime || !endTime) {
        setTotalWorkTime(0);
        return;
      }

      const diff = calcTotalWorkTime(startTime, endTime);
      setTotalWorkTime(diff);
    });
  }, [watch]);

  if (!targetWorkDate) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="w-full text-sm font-bold text-slate-900 md:w-[150px]">
        勤務時間
      </div>
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-start md:gap-4">
        <div className="flex items-start gap-2">
          <StartTimeInput
            dataTestId="desktop-start-time-input"
            highlight={highlightStartTime}
          />
          <div className="pt-2 text-sm text-slate-500">～</div>
          <EndTimeInput
            dataTestId="desktop-end-time-input"
            highlight={highlightEndTime}
          />
        </div>
        <div className="text-sm text-slate-700 md:ml-auto md:pt-2 md:text-right">
          {totalWorkTime.toFixed(1)}時間
        </div>
      </div>
    </div>
  );
}
